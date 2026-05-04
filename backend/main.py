"""
Vidyasagar University ERP — FastAPI Backend (Fixed v5.0)
=========================================================
FIXES:
  1. Data persists across refresh/relogin (all writes go to SQLite)
  2. Cross-table cascade: adding student auto-creates student_fees rows
  3. Deleting student cascades attendance, fees, certs via FK
  4. Adding staff updates courses.faculty where matched
  5. Department counts auto-sync on student/staff add/delete
  6. All responses return correct shapes the frontend expects

Run:
    python seed_data.py        ← first time only
    python erp_db_setup.py     ← first time only
    uvicorn main:app --reload --port 8000
"""

import os, io, csv, secrets, sqlite3
from contextlib import contextmanager, asynccontextmanager
from datetime import datetime
from typing import Optional, List, Dict

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import erp_db_setup as erp_db_setup

# ═══════════════════════════════════════════════════════════════════════════
#  CONFIG
# ═══════════════════════════════════════════════════════════════════════════

DB_TYPE     = "sqlite"
DEFAULT_DB_PATH = os.path.join(os.path.dirname(__file__), "erp_university.db")
SQLITE_PATH = os.getenv("SQLITE_PATH", DEFAULT_DB_PATH)
UPLOADS     = os.getenv("UPLOADS_PATH", os.path.join(os.path.dirname(__file__), "uploads"))
os.makedirs(UPLOADS, exist_ok=True)

DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

def cors_origins():
    configured = os.getenv("ALLOWED_ORIGINS", "")
    if configured.strip():
        return [origin.strip() for origin in configured.split(",") if origin.strip()]
    return DEFAULT_CORS_ORIGINS

def env_flag(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}

DEMO_MODE = env_flag("ERP_DEMO_MODE", False)
ENABLE_RESEED_ROUTE = env_flag("ENABLE_RESEED_ROUTE", False)

# ═══════════════════════════════════════════════════════════════════════════
#  DB HELPERS
# ═══════════════════════════════════════════════════════════════════════════

def get_raw_connection():
    conn = sqlite3.connect(SQLITE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn

@contextmanager
def get_db():
    conn = get_raw_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def ph(n: int = 1) -> str:
    return ", ".join(["?"] * n)

def row_to_dict(row) -> dict:
    return dict(row) if row else {}

def rows_to_list(rows) -> list:
    return [dict(r) for r in rows]

ADMIN_DEPARTMENT_IDS = {"ADM", "LIB", "REG", "HR", "FIN", "ACCT", "ACCOUNTS", "STORE", "HOSTEL", "TRANSPORT"}

def normalize_department_category(category: Optional[str], dept_id: str = "") -> str:
    raw = str(category or "").strip()
    if raw in ("Academic", "Administrative"):
        return raw
    return "Administrative" if str(dept_id or "").strip().upper() in ADMIN_DEPARTMENT_IDS else "Academic"

def ensure_department_category_column(cur):
    cur.execute("PRAGMA table_info(departments)")
    columns = {row["name"] for row in cur.fetchall()}
    if "category" not in columns:
        cur.execute("ALTER TABLE departments ADD COLUMN category TEXT DEFAULT 'Academic'")
    if ADMIN_DEPARTMENT_IDS:
        cur.execute(
            f"UPDATE departments SET category='Administrative' WHERE id IN ({ph(len(ADMIN_DEPARTMENT_IDS))})",
            list(ADMIN_DEPARTMENT_IDS),
        )
    cur.execute(
        "UPDATE departments SET category='Academic' WHERE category IS NULL OR TRIM(category)=''"
    )

FEE_COMPONENTS = [
    ("Tuition", "tuition"),
    ("Hostel", "hostel"),
    ("Transport", "transport_fee"),
    ("Lab", "lab"),
    ("Exam", "exam"),
    ("Library", "library"),
    ("Sports", "sports"),
    ("Development", "development"),
    ("Admission", "admission"),
    ("Alumni", "alumni_fee"),
    ("Medical", "medical"),
    ("Placement", "placement"),
    ("IT Infrastructure", "it_infra"),
    ("Miscellaneous", "miscellaneous"),
]

FEE_CATALOG = [
    {"id": "F001", "type": "Tuition Fee", "label": "Tuition", "key": "tuition", "amount": 125000.0, "freq": "Annual", "due_date": "2025-07-31"},
    {"id": "F002", "type": "Hostel Fee", "label": "Hostel", "key": "hostel", "amount": 65000.0, "freq": "Annual", "due_date": "2025-07-31"},
    {"id": "F003", "type": "Transport Fee", "label": "Transport", "key": "transport_fee", "amount": 18000.0, "freq": "Annual", "due_date": "2025-07-31"},
    {"id": "F004", "type": "Lab Fee", "label": "Lab", "key": "lab", "amount": 8000.0, "freq": "Semester", "due_date": "2025-08-15"},
    {"id": "F005", "type": "Exam Fee", "label": "Exam", "key": "exam", "amount": 2500.0, "freq": "Semester", "due_date": "2025-10-01"},
    {"id": "F006", "type": "Library Fee", "label": "Library", "key": "library", "amount": 2500.0, "freq": "Annual", "due_date": "2025-07-31"},
    {"id": "F007", "type": "Sports Fee", "label": "Sports", "key": "sports", "amount": 1500.0, "freq": "Annual", "due_date": "2025-07-31"},
    {"id": "F008", "type": "Development Fee", "label": "Development", "key": "development", "amount": 5000.0, "freq": "Annual", "due_date": "2025-07-31"},
    {"id": "F009", "type": "Admission Fee", "label": "Admission", "key": "admission", "amount": 10000.0, "freq": "One-time", "due_date": "2025-07-31"},
    {"id": "F010", "type": "Alumni Fee", "label": "Alumni", "key": "alumni_fee", "amount": 2000.0, "freq": "One-time", "due_date": "2025-07-31"},
    {"id": "F011", "type": "Medical Fee", "label": "Medical", "key": "medical", "amount": 1000.0, "freq": "Annual", "due_date": "2025-07-31"},
    {"id": "F012", "type": "Placement Fee", "label": "Placement", "key": "placement", "amount": 5000.0, "freq": "One-time", "due_date": "2025-12-31"},
    {"id": "F013", "type": "IT Infrastructure Fee", "label": "IT Infrastructure", "key": "it_infra", "amount": 3000.0, "freq": "Annual", "due_date": "2025-07-31"},
    {"id": "F014", "type": "Miscellaneous Fee", "label": "Miscellaneous", "key": "miscellaneous", "amount": 500.0, "freq": "Annual", "due_date": "2025-07-31"},
]

FEE_TYPE_TO_KEY = {item["type"]: item["key"] for item in FEE_CATALOG}
FEE_KEY_TO_TYPE = {item["key"]: item["type"] for item in FEE_CATALOG}
FEE_KEY_TO_CATALOG = {item["key"]: item for item in FEE_CATALOG}

def fee_amount(source, key: str) -> float:
    value = source.get(key, 0) if isinstance(source, dict) else getattr(source, key, 0)
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0

def fee_total(source) -> float:
    return sum(max(0.0, fee_amount(source, key)) for _, key in FEE_COMPONENTS)

def recalculate_student_fee_fields(student) -> float:
    total = fee_total(student)
    paid = max(0.0, float(student.fees_paid or 0))
    student.fees_paid = paid
    if total > 0:
        student.fees_due = max(0.0, total - paid)
    else:
        student.fees_due = max(0.0, float(student.fees_due or 0))

    from datetime import date
    today = date.today().isoformat()
    if total > 0 and paid >= total:
        student.fee_status = "Paid"
    elif student.fees_due > 0 and student.fee_due_date and student.fee_due_date < today:
        student.fee_status = "Overdue"
    elif student.fees_due > 0:
        student.fee_status = "Pending"
    elif paid > 0:
        student.fee_status = "Paid"
    else:
        student.fee_status = student.fee_status or "Pending"
    return total

def next_id(cur, table: str, prefix: str, id_col: str = "id") -> str:
    cur.execute(f"SELECT {id_col} FROM {table} ORDER BY {id_col} DESC LIMIT 1")
    row = cur.fetchone()
    if not row:
        return f"{prefix}001"
    try:
        num = int(row[0][len(prefix):])
    except (ValueError, IndexError):
        num = 0
    return f"{prefix}{str(num + 1).zfill(3)}"

def ensure_fee_catalog(cur):
    """Backfill missing fee heads into the fee master table."""
    cur.execute("SELECT id, type FROM fees")
    existing_ids = set()
    existing_types = set()
    for row in cur.fetchall():
        existing_ids.add(row["id"])
        existing_types.add(row["type"])

    for item in FEE_CATALOG:
        if item["id"] in existing_ids or item["type"] in existing_types:
            continue
        cur.execute(
            f"INSERT INTO fees (id, type, amount, freq, due_date, collected, pending) VALUES ({ph(7)})",
            (item["id"], item["type"], item["amount"], item["freq"], item["due_date"], 0, 0),
        )

def fee_row_payload(row: dict) -> dict:
    payload = dict(row)
    key = FEE_TYPE_TO_KEY.get(payload.get("type"))
    if key:
        payload["key"] = key
        payload["label"] = FEE_KEY_TO_CATALOG[key]["label"]
    return payload

def load_student_fee_collections(cur, student_ids: List[str]) -> Dict[str, Dict[str, float]]:
    if not student_ids:
        return {}

    cur.execute(
        f"""
        SELECT sf.student_id, f.type, sf.amount_paid
        FROM student_fees sf
        JOIN fees f ON f.id = sf.fee_id
        WHERE sf.student_id IN ({ph(len(student_ids))})
        """,
        student_ids,
    )
    collections: Dict[str, Dict[str, float]] = {}
    for row in cur.fetchall():
        key = FEE_TYPE_TO_KEY.get(row["type"])
        if not key:
            continue
        collections.setdefault(row["student_id"], {})[key] = float(row["amount_paid"] or 0)
    return collections

def attach_student_fee_collections(cur, student_rows: List[dict]) -> List[dict]:
    if not student_rows:
        return student_rows
    collections = load_student_fee_collections(cur, [row["id"] for row in student_rows])
    for row in student_rows:
        row["fee_collections"] = collections.get(row["id"], {})
    return student_rows

def provided_model_fields(model) -> set:
    return getattr(model, "model_fields_set", getattr(model, "__fields_set__", set()))

def sync_student_fee_collections(cur, student_id: str, fee_collections: Dict[str, float], paid_date: Optional[str] = None):
    ensure_fee_catalog(cur)
    auto_create_student_fees(cur, student_id)

    cleaned = {
        key: max(0.0, fee_amount(fee_collections, key))
        for _, key in FEE_COMPONENTS
    }
    for key, amount in cleaned.items():
        fee_type = FEE_KEY_TO_TYPE.get(key)
        if not fee_type:
            continue
        cur.execute("SELECT id FROM fees WHERE type=?", (fee_type,))
        fee_row = cur.fetchone()
        if not fee_row:
            continue
        cur.execute(
            """
            UPDATE student_fees
            SET amount_paid=?, paid_date=?
            WHERE student_id=? AND fee_id=?
            """,
            (amount, paid_date or None, student_id, fee_row["id"]),
        )

def sync_fee_master_balances(cur):
    ensure_fee_catalog(cur)
    for _, key in FEE_COMPONENTS:
        catalog = FEE_KEY_TO_CATALOG.get(key)
        if not catalog:
            continue
        cur.execute(f"SELECT COALESCE(SUM({key}), 0) FROM students")
        total_demand = float(cur.fetchone()[0] or 0)
        cur.execute(
            """
            SELECT COALESCE(SUM(sf.amount_paid), 0)
            FROM student_fees sf
            JOIN fees f ON f.id = sf.fee_id
            WHERE f.type=?
            """,
            (catalog["type"],),
        )
        total_collected = float(cur.fetchone()[0] or 0)
        cur.execute(
            "UPDATE fees SET collected=?, pending=? WHERE type=?",
            (round(total_collected, 2), round(max(0.0, total_demand - total_collected), 2), catalog["type"]),
        )

def ensure_all_student_fee_rows(cur):
    ensure_fee_catalog(cur)
    cur.execute("SELECT id FROM students")
    for row in cur.fetchall():
        auto_create_student_fees(cur, row["id"])

def clear_attendance_exclusion(cur, student_id: str, dept: str, month: str, subject: str = ""):
    cur.execute(
        """
        DELETE FROM attendance_exclusions
        WHERE student_id=? AND dept=? AND LOWER(month)=LOWER(?) AND COALESCE(subject, '')=COALESCE(?, '')
        """,
        (student_id, dept, month, subject or ""),
    )

def upsert_attendance_record(cur, attendance):
    subject = (attendance.subject or "").strip()
    cur.execute(
        """
        SELECT id FROM attendance
        WHERE student_id=? AND dept=? AND date=? AND COALESCE(subject, '')=COALESCE(?, '')
        ORDER BY id DESC LIMIT 1
        """,
        (attendance.student_id, attendance.dept, attendance.date, subject),
    )
    row = cur.fetchone()
    if not row and subject:
        cur.execute(
            """
            SELECT id FROM attendance
            WHERE student_id=? AND dept=? AND date=? AND COALESCE(subject, '')=''
            ORDER BY id DESC LIMIT 1
            """,
            (attendance.student_id, attendance.dept, attendance.date),
        )
        row = cur.fetchone()
    if row:
        cur.execute(
            """
            UPDATE attendance
            SET student_name=?, status=?, month=?, year=?, subject=?
            WHERE id=?
            """,
            (attendance.student_name, attendance.status, attendance.month, attendance.year, subject or None, row["id"]),
        )
        return row["id"]

    if not attendance.id:
        cur.execute("SELECT COUNT(*) FROM attendance")
        n = cur.fetchone()[0]
        attendance.id = f"AT{str(n+1).zfill(4)}"
    cur.execute(
        f"""
        INSERT INTO attendance (id,student_id,student_name,dept,date,status,month,year,subject)
        VALUES ({ph(9)})
        """,
        (
            attendance.id,
            attendance.student_id,
            attendance.student_name,
            attendance.dept,
            attendance.date,
            attendance.status,
            attendance.month,
            attendance.year,
            subject or None,
        ),
    )
    return attendance.id

# ═══════════════════════════════════════════════════════════════════════════
#  SYNC HELPERS — keep dept counts accurate after every mutation
# ═══════════════════════════════════════════════════════════════════════════

def sync_dept_counts(cur, dept_id: str):
    """Recalculate and update departments.students and departments.faculty."""
    cur.execute("SELECT COUNT(*) FROM students WHERE dept=? AND status='Active'", (dept_id,))
    sc = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM staff WHERE dept=?", (dept_id,))
    fc = cur.fetchone()[0]
    cur.execute("UPDATE departments SET students=?, faculty=? WHERE id=?", (sc, fc, dept_id))

def auto_create_student_fees(cur, student_id: str):
    """When a new student is added, create a fee ledger row for every fee type."""
    ensure_fee_catalog(cur)
    cur.execute("SELECT id FROM fees ORDER BY id")
    fee_ids = [r[0] for r in cur.fetchall()]
    for fid in fee_ids:
        try:
            cur.execute(
                f"INSERT INTO student_fees (student_id, fee_id, amount_paid) VALUES ({ph(3)})",
                (student_id, fid, 0)
            )
        except Exception:
            pass  # already exists

def auto_enroll_courses(cur, student_id: str, dept: str, year: int):
    """Enroll student in all core courses matching their dept."""
    cur.execute("SELECT code, sem FROM courses WHERE dept=? AND type='Core'", (dept,))
    courses = cur.fetchall()
    yr = datetime.now().year
    for c in courses:
        try:
            cur.execute(
                f"INSERT INTO course_enrollment (student_id, course_code, sem, academic_yr) VALUES ({ph(4)})",
                (student_id, c[0], c[1], yr)
            )
        except Exception:
            pass  # already enrolled

def update_course_enrolment_count(cur, course_code: str):
    """Sync courses.students from course_enrollment table."""
    cur.execute("SELECT COUNT(*) FROM course_enrollment WHERE course_code=?", (course_code,))
    n = cur.fetchone()[0]
    cur.execute("UPDATE courses SET students=? WHERE code=?", (n, course_code))

def backfill_course_enrollments(cur):
    """Ensure seeded/imported students are reflected in the enrollment junction table."""
    cur.execute("SELECT id, dept, year FROM students")
    for student_id, dept, year in cur.fetchall():
        auto_enroll_courses(cur, student_id, dept, year)
    cur.execute("SELECT code FROM courses")
    for row in cur.fetchall():
        update_course_enrolment_count(cur, row[0])

# ═══════════════════════════════════════════════════════════════════════════
#  APP
# ═══════════════════════════════════════════════════════════════════════════




# ═══════════════════════════════════════════════════════════════════════════
#  STARTUP — auto-init DB if missing
# ═══════════════════════════════════════════════════════════════════════════

EXTRA_DDL = [
    """CREATE TABLE IF NOT EXISTS transport (
        id TEXT PRIMARY KEY, name TEXT, area TEXT,
        stops INTEGER DEFAULT 0, students INTEGER DEFAULT 0,
        driver TEXT, bus TEXT, time TEXT, contact TEXT
    )""",
    """CREATE TABLE IF NOT EXISTS batches (
        id TEXT PRIMARY KEY, year TEXT, dept TEXT,
        students INTEGER DEFAULT 0, mentor TEXT
    )""",
    """CREATE TABLE IF NOT EXISTS aicte_checklist (
        id TEXT PRIMARY KEY, cat TEXT, item TEXT,
        status TEXT DEFAULT 'ok', note TEXT
    )""",
    """CREATE TABLE IF NOT EXISTS aicte_inspections (
        id TEXT PRIMARY KEY, date TEXT, title TEXT,
        body TEXT, color TEXT DEFAULT 'tl-gold'
    )""",
    """CREATE TABLE IF NOT EXISTS aicte_institution (
        id TEXT PRIMARY KEY, key TEXT, value TEXT
    )""",
    """CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY, title TEXT, message TEXT,
        type TEXT DEFAULT 'warn', date TEXT
    )""",
    """CREATE TABLE IF NOT EXISTS alumni (
        id TEXT PRIMARY KEY, name TEXT, dept TEXT,
        batch INTEGER, phone TEXT, email TEXT,
        employer TEXT, jobTitle TEXT, workCity TEXT,
        sector TEXT, passYear TEXT,
        cgpa REAL DEFAULT 0, gender TEXT, address TEXT,
        guardian TEXT, dob TEXT, status TEXT DEFAULT 'Inactive'
    )""",
    # Ensure student_fees junction exists
    """CREATE TABLE IF NOT EXISTS student_fees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        fee_id TEXT NOT NULL REFERENCES fees(id) ON DELETE RESTRICT,
        amount_paid REAL DEFAULT 0,
        paid_date TEXT,
        receipt_no TEXT,
        UNIQUE(student_id, fee_id)
    )""",
    # Ensure course_enrollment exists
    """CREATE TABLE IF NOT EXISTS course_enrollment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        course_code TEXT NOT NULL REFERENCES courses(code) ON DELETE CASCADE,
        sem INTEGER,
        academic_yr INTEGER,
        grade TEXT,
        UNIQUE(student_id, course_code, academic_yr)
    )""",
    """CREATE TABLE IF NOT EXISTS attendance_exclusions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dept TEXT NOT NULL,
        subject TEXT NOT NULL DEFAULT '',
        month TEXT NOT NULL,
        year INTEGER,
        student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE(dept, subject, month, student_id)
    )""",
]



def _seed_extra_if_empty(cur):
    """Seed transport, batches, aicte, alerts, alumni from ./data/ CSV if tables are empty."""
    DATA = os.path.join(os.path.dirname(__file__), "data")
    ensure_fee_catalog(cur)

    def read(fname):
        p = os.path.join(DATA, fname)
        if not os.path.exists(p):
            return []
        with open(p, newline="", encoding="utf-8-sig") as f:
            return list(csv.DictReader(f))

    # transport
    cur.execute("SELECT COUNT(*) FROM transport")
    if cur.fetchone()[0] == 0:
        for r in read("transport.csv"):
            try:
                cur.execute(f"INSERT INTO transport VALUES ({ph(9)})",
                    (r["id"],r["name"],r["area"],int(r.get("stops",0)),
                     int(r.get("students",0)),r["driver"],r["bus"],r["time"],r.get("contact","")))
            except Exception: pass

    # batches
    cur.execute("SELECT COUNT(*) FROM batches")
    if cur.fetchone()[0] == 0:
        for r in read("batches.csv"):
            try:
                cur.execute(f"INSERT INTO batches VALUES ({ph(5)})",
                    (r["id"],r["year"],r["dept"],int(r.get("students",0)),r["mentor"]))
            except Exception: pass

    # aicte_checklist
    cur.execute("SELECT COUNT(*) FROM aicte_checklist")
    if cur.fetchone()[0] == 0:
        for r in read("aicte_checklist.csv"):
            try:
                cur.execute(f"INSERT INTO aicte_checklist VALUES ({ph(5)})",
                    (r["id"],r["cat"],r["item"],r["status"],r.get("note","")))
            except Exception: pass

    # alerts
    cur.execute("SELECT COUNT(*) FROM alerts")
    if cur.fetchone()[0] == 0:
        for r in read("alerts.csv"):
            try:
                cur.execute(f"INSERT INTO alerts VALUES ({ph(5)})",
                    (r["id"],r["title"],r["message"],r["type"],r.get("date","")))
            except Exception: pass

    # alumni
    cur.execute("SELECT COUNT(*) FROM alumni")
    if cur.fetchone()[0] == 0:
        for r in read("alumni.csv"):
            try:
                cur.execute(
                    f"""
                    INSERT INTO alumni
                        (id,name,dept,batch,phone,email,employer,jobTitle,workCity,
                         sector,passYear,cgpa,gender,address,guardian,dob,status)
                    VALUES ({ph(17)})
                    """,
                    (
                        r["id"], r["name"], r["dept"], int(r.get("batch", 0) or 0),
                        r.get("phone", ""), r.get("email", ""), r.get("company", ""),
                        r.get("role", ""), "", "", str(r.get("batch", "")),
                        float(r.get("cgpa", 0) or 0), "", r.get("message", ""),
                        "", "", "Inactive",
                    ),
                )
            except Exception:
                pass

    # aicte_inspections
    cur.execute("SELECT COUNT(*) FROM aicte_inspections")
    if cur.fetchone()[0] == 0:
        for r in read("aicte_inspections.csv"):
            try:
                cur.execute(f"INSERT INTO aicte_inspections VALUES ({ph(5)})",
                    (r["id"],r["date"],r["title"],r["body"],r.get("color","tl-gold")))
            except Exception: pass

    # aicte_institution
    cur.execute("SELECT COUNT(*) FROM aicte_institution")
    if cur.fetchone()[0] == 0:
        for r in read("aicte_institution.csv"):
            try:
                cur.execute(f"INSERT INTO aicte_institution VALUES ({ph(3)})",
                    (r["id"],r["key"],r["value"]))
            except Exception: pass

    ensure_all_student_fee_rows(cur)
    sync_fee_master_balances(cur)

# ═══════════════════════════════════════════════════════════════════════════
#  AUTH
# ═══════════════════════════════════════════════════════════════════════════

USERS = {
    "admin":    {"password":"admin@123",   "role":"Admin",           "name":"Admin User",       "email":"admin@vidyasagar.ac.in",  "dept":"Administration"},
    "hod":      {"password":"hod@123",     "role":"HOD",             "name":"Dr. Ramesh Kumar", "email":"ramesh@vidyasagar.ac.in", "dept":"CSE"},
    "teacher":  {"password":"teach@123",   "role":"Teaching Staff",  "name":"Prof. Anita Das",  "email":"anita@vidyasagar.ac.in",  "dept":"CSE"},
    "support":  {"password":"support@123", "role":"Support Staff",   "name":"Rajesh Nair",      "email":"rajesh@vidyasagar.ac.in", "dept":"Administration"},
    "examctrl": {"password":"exam@123",    "role":"Exam Controller", "name":"Dr. Meena Iyer",   "email":"meena@vidyasagar.ac.in",  "dept":"Examinations"},
}
ACTIVE_TOKENS: dict = {}

class LoginRequest(BaseModel):
    username: str
    password: str

@asynccontextmanager
async def lifespan(app):
    # startup
    with get_db() as conn:
        cur = conn.cursor()
        import erp_db_setup
        erp_db_setup.create_tables(conn)
        for ddl in EXTRA_DDL:
            try: cur.execute(ddl)
            except Exception: pass
        ensure_department_category_column(cur)
        cur.execute("SELECT COUNT(*) FROM students")
        if cur.fetchone()[0] == 0:
            erp_db_setup.seed_departments(conn)
            erp_db_setup.seed_students(conn)
            erp_db_setup.seed_staff(conn)
            erp_db_setup.seed_courses(conn)
            erp_db_setup.seed_exams(conn)
            erp_db_setup.seed_fees(conn)
            erp_db_setup.seed_certificates(conn)
            erp_db_setup.seed_publications(conn)
        ensure_fee_catalog(cur)
        _seed_extra_if_empty(cur)
        ensure_all_student_fee_rows(cur)
        backfill_course_enrollments(cur)
        sync_fee_master_balances(cur)
    print("\u2705  Database ready.")
    yield
    # shutdown (nothing needed)

app = FastAPI(title="Vidyasagar University ERP API", version="5.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"api":"Vidyasagar University ERP","version":"5.0.0","db":"sqlite"}

@app.get("/health")
def health():
    db_exists = os.path.exists(SQLITE_PATH)
    return {
        "status": "ok",
        "db_path": SQLITE_PATH,
        "db_exists": db_exists,
        "demo_mode": DEMO_MODE,
    }

@app.post("/auth/login")
def login(req: LoginRequest):
    user = USERS.get(req.username)
    if not user or user["password"] != req.password:
        raise HTTPException(401, "Invalid username or password")
    token = secrets.token_hex(32)
    ACTIVE_TOKENS[token] = req.username
    return {"token":token,"role":user["role"],"name":user["name"],
            "email":user["email"],"dept":user["dept"],"username":req.username}

@app.post("/auth/logout")
def logout(token: str):
    ACTIVE_TOKENS.pop(token, None)
    return {"message":"Logged out"}

@app.get("/auth/me")
def get_me(token: str):
    username = ACTIVE_TOKENS.get(token)
    if not username:
        raise HTTPException(401, "Invalid or expired token")
    user = USERS[username]
    return {"username":username,"role":user["role"],"name":user["name"],
            "email":user["email"],"dept":user["dept"]}

# ═══════════════════════════════════════════════════════════════════════════
#  PYDANTIC MODELS
# ═══════════════════════════════════════════════════════════════════════════

class StudentModel(BaseModel):
    id: str = ""
    name: str
    dept: str
    year: int
    batch: int = 2024
    gender: str = ""
    dob: str = ""
    phone: str = ""
    email: str = ""
    status: str = "Active"
    cgpa: float = 0.0
    fee_status: str = "Pending"
    transport: str = "Own"
    guardian: str = ""
    address: str = ""
    tuition: float = 0.0
    hostel: float = 0.0
    transport_fee: float = 0.0
    lab: float = 0.0
    exam: float = 0.0
    library: float = 0.0
    sports: float = 0.0
    development: float = 0.0
    admission: float = 0.0
    alumni_fee: float = 0.0
    medical: float = 0.0
    placement: float = 0.0
    it_infra: float = 0.0
    miscellaneous: float = 0.0
    fees_paid: float = 0.0
    fees_due: float = 0.0
    fee_due_date: str = "2025-07-31"
    fee_collections: Dict[str, float] = Field(default_factory=dict)

class AlumniModel(BaseModel):
    id: str = ""
    name: str
    dept: str
    batch: int = 2024
    phone: str = ""
    email: str = ""
    employer: str = ""
    jobTitle: str = ""
    workCity: str = ""
    sector: str = ""
    passYear: str = ""
    cgpa: float = 0.0
    gender: str = ""
    address: str = ""
    guardian: str = ""
    dob: str = ""
    status: str = "Inactive"

class StaffModel(BaseModel):
    id: str = ""
    name: str
    dept: str
    role: str
    type: str
    qual: str
    exp: int
    publications: int = 0
    status: str = "Active"
    email: str = ""
    phone: str = ""

class CourseModel(BaseModel):
    code: str
    name: str
    dept: str
    credits: int
    type: str
    faculty: str
    sem: int
    students: int = 0
    syllabus: str = ""

class ExamModel(BaseModel):
    id: str = ""
    name: str
    dept: str
    type: str
    date: str
    status: str = "Scheduled"
    total: int = 0
    hall_tickets: bool = False

class FeeModel(BaseModel):
    id: str = ""
    type: str
    amount: float
    freq: str
    due_date: str
    collected: float = 0
    pending: float = 0

class RouteModel(BaseModel):
    id: str = ""
    name: str
    area: str
    stops: int = 0
    students: int = 0
    driver: str = ""
    bus: str = ""
    time: str = ""
    contact: str = ""

class CertModel(BaseModel):
    id: str = ""
    type: str
    student: str
    date: str
    status: str = "Pending"
    verif: str = "—"

class PubModel(BaseModel):
    id: str = ""
    title: str
    author: str
    journal: str
    year: int
    type: str
    impact: str = "—"

class AttModel(BaseModel):
    id: str = ""
    student_id: str
    student_name: str
    dept: str
    date: str
    status: str
    month: str
    year: int
    subject: str = ""

class DeptModel(BaseModel):
    id: str
    name: str
    hod: str
    category: str = "Academic"
    faculty: int = 0
    students: int = 0
    estd: int = 1990
    pg: str = ""

class AICTEItemModel(BaseModel):
    id: str = ""
    cat: str
    item: str
    status: str = "ok"
    note: str = ""

class InspectionModel(BaseModel):
    id: str = ""
    date: str
    title: str
    body: str
    color: str = "tl-gold"

class InstitutionRecordModel(BaseModel):
    id: str = ""
    key: str
    value: str

class BatchModel(BaseModel):
    id: str = ""
    year: str
    dept: str
    students: int
    mentor: str

class AlertModel(BaseModel):
    id: str = ""
    title: str
    message: str
    type: str = "warn"
    date: str = ""

# ═══════════════════════════════════════════════════════════════════════════
#  DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/analytics/dashboard")
def dashboard():
    with get_db() as conn:
        cur = conn.cursor()
        ensure_fee_catalog(cur)
        ensure_all_student_fee_rows(cur)
        sync_fee_master_balances(cur)
        cur.execute("SELECT COUNT(*) FROM students")
        total_students = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM students WHERE status='Active'")
        active_students = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM alumni")
        total_alumni = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM staff")
        total_staff = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM staff WHERE type='Teaching'")
        teaching_staff = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM courses")
        total_courses = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM exams")
        total_exams = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM exams WHERE status IN ('Upcoming','Scheduled')")
        upcoming_exams = cur.fetchone()[0]
        cur.execute("SELECT SUM(amount), SUM(collected) FROM fees")
        fee_row = cur.fetchone()
        total_fees = float(fee_row[0] or 0)
        collected   = float(fee_row[1] or 0)
    return {
        "students": {"total":total_students,"active":active_students},
        "alumni":   {"total":total_alumni},
        "staff":    {"total":total_staff,"teaching":teaching_staff},
        "courses":  {"total":total_courses},
        "exams":    {"total":total_exams,"upcoming":upcoming_exams},
        "fees":     {"total":total_fees,"collected":collected,
                     "pct":round(collected/total_fees*100,1) if total_fees else 0},
    }

# ═══════════════════════════════════════════════════════════════════════════
#  STUDENTS  — with cascade on add/delete
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/students")
def get_students(dept: Optional[str]=None, year: Optional[int]=None,
                 status: Optional[str]=None, search: Optional[str]=None):
    with get_db() as conn:
        cur = conn.cursor()
        ensure_fee_catalog(cur)
        ensure_all_student_fee_rows(cur)
        q = "SELECT * FROM students WHERE 1=1"
        params = []
        if dept:   q += f" AND dept=?";                    params.append(dept)
        if year:   q += f" AND year=?";                    params.append(year)
        if status: q += f" AND LOWER(status)=LOWER(?)";    params.append(status)
        if search:
            q += " AND (LOWER(name) LIKE LOWER(?) OR LOWER(id) LIKE LOWER(?))"
            params.extend([f"%{search}%", f"%{search}%"])
        cur.execute(q, params)
        rows = attach_student_fee_collections(cur, rows_to_list(cur.fetchall()))
    return {"total":len(rows),"students":rows}

@app.get("/students/batches")
def get_student_batches():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT DISTINCT batch FROM students ORDER BY batch DESC")
        batches = [str(r[0]) for r in cur.fetchall()]
    return {"batches":batches}

@app.get("/students/{student_id}")
def get_student(student_id: str):
    with get_db() as conn:
        cur = conn.cursor()
        ensure_fee_catalog(cur)
        ensure_all_student_fee_rows(cur)
        cur.execute("SELECT * FROM students WHERE id=?", (student_id,))
        row = cur.fetchone()
        student = attach_student_fee_collections(cur, [row_to_dict(row)]) if row else []
    if not row: raise HTTPException(404, "Student not found")
    return student[0]

@app.post("/students", status_code=201)
def create_student(s: StudentModel):
    with get_db() as conn:
        cur = conn.cursor()
        provided_fields = provided_model_fields(s)
        # Always auto-generate sequential ID
        s.id = next_id(cur, "students", "S")
        if "fee_collections" in provided_fields:
            s.fees_paid = sum(max(0.0, fee_amount(s.fee_collections, key)) for _, key in FEE_COMPONENTS)
        recalculate_student_fee_fields(s)
        cur.execute(
            "INSERT INTO students (id,name,dept,year,batch,gender,dob,phone,email,"
            "status,cgpa,fee_status,transport,guardian,address,"
            "tuition,hostel,transport_fee,lab,exam,library,sports,development,"
            "admission,alumni_fee,medical,placement,it_infra,miscellaneous,"
            "paid,balance,due_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (s.id,s.name,s.dept,s.year,s.batch,s.gender,s.dob,s.phone,s.email,
             s.status,s.cgpa,s.fee_status,s.transport,s.guardian,s.address,
             s.tuition,s.hostel,s.transport_fee,s.lab,s.exam,s.library,
             s.sports,s.development,s.admission,s.alumni_fee,s.medical,
             s.placement,s.it_infra,s.miscellaneous,
             s.fees_paid,s.fees_due,s.fee_due_date))
        # CASCADE: create fee ledger rows for this student
        auto_create_student_fees(cur, s.id)
        if "fee_collections" in provided_fields:
            sync_student_fee_collections(cur, s.id, s.fee_collections, s.fee_due_date)
        # CASCADE: enroll in dept core courses
        auto_enroll_courses(cur, s.id, s.dept, s.year)
        # CASCADE: sync dept student count
        sync_dept_counts(cur, s.dept)
        sync_fee_master_balances(cur)
        # Return the full student row so the frontend can append it directly
        cur.execute("SELECT * FROM students WHERE id=?", (s.id,))
        row = cur.fetchone()
        student = dict(row) if row else {"id": s.id, }
        student = attach_student_fee_collections(cur, [student])[0]
    return {"message": "Student created", "student": student}

@app.put("/students/{student_id}")
def update_student(student_id: str, s: StudentModel):
    with get_db() as conn:
        cur = conn.cursor()
        provided_fields = provided_model_fields(s)
        cur.execute("SELECT dept FROM students WHERE id=?", (student_id,))
        row = cur.fetchone()
        if not row: raise HTTPException(404, "Student not found")
        old_dept = row[0]
        if "fee_collections" in provided_fields:
            s.fees_paid = sum(max(0.0, fee_amount(s.fee_collections, key)) for _, key in FEE_COMPONENTS)
        recalculate_student_fee_fields(s)
        cur.execute(
            "UPDATE students SET name=?,dept=?,year=?,batch=?,gender=?,dob=?,"
            "phone=?,email=?,status=?,cgpa=?,fee_status=?,transport=?,guardian=?,address=?,"
            "tuition=?,hostel=?,transport_fee=?,lab=?,exam=?,library=?,sports=?,development=?,"
            "admission=?,alumni_fee=?,medical=?,placement=?,it_infra=?,miscellaneous=?,"
            "paid=?,balance=?,due_date=? WHERE id=?",
            (s.name,s.dept,s.year,s.batch,s.gender,s.dob,s.phone,s.email,
             s.status,s.cgpa,s.fee_status,s.transport,s.guardian,s.address,
             s.tuition,s.hostel,s.transport_fee,s.lab,s.exam,s.library,
             s.sports,s.development,s.admission,s.alumni_fee,s.medical,
             s.placement,s.it_infra,s.miscellaneous,
             s.fees_paid,s.fees_due,s.fee_due_date,student_id))
        if "fee_collections" in provided_fields:
            sync_student_fee_collections(cur, student_id, s.fee_collections, s.fee_due_date)
        sync_dept_counts(cur, s.dept)
        if old_dept != s.dept:
            sync_dept_counts(cur, old_dept)
        sync_fee_master_balances(cur)
    return {"message":"Updated"}

@app.delete("/students/{student_id}")
def delete_student(student_id: str):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT dept FROM students WHERE id=?", (student_id,))
        row = cur.fetchone()
        if not row: raise HTTPException(404, "Student not found")
        dept = row[0]
        # CASCADE: attendance, student_fees, course_enrollment deleted via FK ON DELETE CASCADE
        cur.execute("DELETE FROM students WHERE id=?", (student_id,))
        sync_dept_counts(cur, dept)
    return {"message":"Deleted"}

# ═══════════════════════════════════════════════════════════════════════════
#  ALUMNI
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/alumni")
def get_alumni(dept: Optional[str]=None, search: Optional[str]=None):
    with get_db() as conn:
        cur = conn.cursor()
        q = "SELECT * FROM alumni WHERE 1=1"
        params = []
        if dept:
            q += " AND dept=?"; params.append(dept)
        if search:
            q += " AND (LOWER(name) LIKE LOWER(?) OR LOWER(employer) LIKE LOWER(?))"
            params.extend([f"%{search}%", f"%{search}%"])
        cur.execute(q, params)
        rows = rows_to_list(cur.fetchall())
    return {"total":len(rows),"alumni":rows}

@app.post("/alumni", status_code=201)
def create_alumni(a: AlumniModel):
    with get_db() as conn:
        cur = conn.cursor()
        if not a.id:
            a.id = next_id(cur, "alumni", "AL")
        cur.execute(f"""
            INSERT INTO alumni
                (id,name,dept,batch,phone,email,employer,jobTitle,workCity,
                 sector,passYear,cgpa,gender,address,guardian,dob,status)
            VALUES ({ph(17)})
        """, (a.id,a.name,a.dept,a.batch,a.phone,a.email,a.employer,a.jobTitle,
              a.workCity,a.sector,a.passYear,a.cgpa,a.gender,a.address,
              a.guardian,a.dob,a.status))
    return {"message":"Alumni added","id":a.id}

@app.put("/alumni/{alumni_id}")
def update_alumni(alumni_id: str, a: AlumniModel):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM alumni WHERE id=?", (alumni_id,))
        if not cur.fetchone(): raise HTTPException(404, "Alumni not found")
        cur.execute(f"""
            UPDATE alumni SET name=?,dept=?,batch=?,phone=?,email=?,employer=?,
                jobTitle=?,workCity=?,sector=?,passYear=?,cgpa=?,gender=?,
                address=?,guardian=?,dob=?,status=?
            WHERE id=?
        """, (a.name,a.dept,a.batch,a.phone,a.email,a.employer,a.jobTitle,
              a.workCity,a.sector,a.passYear,a.cgpa,a.gender,a.address,
              a.guardian,a.dob,a.status,alumni_id))
    return {"message":"Updated"}

@app.delete("/alumni/{alumni_id}")
def delete_alumni(alumni_id: str):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM alumni WHERE id=?", (alumni_id,))
        if cur.rowcount == 0: raise HTTPException(404, "Alumni not found")
    return {"message":"Deleted"}

# ═══════════════════════════════════════════════════════════════════════════
#  STAFF  — with dept count sync
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/staff")
def get_staff(type: Optional[str]=None, dept: Optional[str]=None):
    with get_db() as conn:
        cur = conn.cursor()
        q = "SELECT * FROM staff WHERE 1=1"
        params = []
        if type:  q += " AND LOWER(type)=LOWER(?)"; params.append(type)
        if dept:  q += " AND dept=?";               params.append(dept)
        cur.execute(q, params)
        rows = rows_to_list(cur.fetchall())
    return {"total":len(rows),"staff":rows}

@app.post("/staff", status_code=201)
def create_staff(s: StaffModel):
    with get_db() as conn:
        cur = conn.cursor()
        if not s.id:
            prefix = "T" if s.type == "Teaching" else "SP"
            s.id = next_id(cur, "staff", prefix)
        cur.execute(f"""
            INSERT INTO staff (id,name,dept,role,type,qual,exp,publications,status,email,phone)
            VALUES ({ph(11)})
        """, (s.id,s.name,s.dept,s.role,s.type,s.qual,
              s.exp,s.publications,s.status,s.email,s.phone))
        # CASCADE: update courses where this staff is faculty (name match)
        cur.execute("UPDATE courses SET faculty_id=? WHERE faculty=?", (s.id, s.name))
        try:
            sync_dept_counts(cur, s.dept)
        except Exception:
            pass
    return {"message":"Staff created","id":s.id}

@app.put("/staff/{staff_id}")
def update_staff(staff_id: str, s: StaffModel):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT dept FROM staff WHERE id=?", (staff_id,))
        row = cur.fetchone()
        if not row: raise HTTPException(404, "Staff not found")
        old_dept = row[0]
        cur.execute(f"""
            UPDATE staff SET name=?,dept=?,role=?,type=?,qual=?,exp=?,
                publications=?,status=?,email=?,phone=?
            WHERE id=?
        """, (s.name,s.dept,s.role,s.type,s.qual,s.exp,
              s.publications,s.status,s.email,s.phone,staff_id))
        # Keep courses.faculty name in sync
        cur.execute("UPDATE courses SET faculty=? WHERE faculty_id=?", (s.name, staff_id))
        try:
            sync_dept_counts(cur, s.dept)
            if old_dept != s.dept:
                sync_dept_counts(cur, old_dept)
        except Exception:
            pass
    return {"message":"Updated"}

@app.delete("/staff/{staff_id}")
def delete_staff(staff_id: str):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT dept FROM staff WHERE id=?", (staff_id,))
        row = cur.fetchone()
        if not row: raise HTTPException(404, "Staff not found")
        dept = row[0]
        # Nullify faculty_id on courses they taught
        cur.execute("UPDATE courses SET faculty_id=NULL WHERE faculty_id=?", (staff_id,))
        cur.execute("DELETE FROM staff WHERE id=?", (staff_id,))
        try:
            sync_dept_counts(cur, dept)
        except Exception:
            pass
    return {"message":"Deleted"}

# ═══════════════════════════════════════════════════════════════════════════
#  DEPARTMENTS
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/departments")
def get_departments():
    with get_db() as conn:
        cur = conn.cursor()
        ensure_department_category_column(cur)
        cur.execute("SELECT * FROM departments")
        rows = rows_to_list(cur.fetchall())
    return {"total":len(rows),"departments":rows}

@app.post("/departments", status_code=201)
def create_department(d: DeptModel):
    with get_db() as conn:
        cur = conn.cursor()
        ensure_department_category_column(cur)
        dept_id = d.id.strip().upper()
        cur.execute("SELECT id FROM departments WHERE id=?", (dept_id,))
        if cur.fetchone(): raise HTTPException(409, "Department ID already exists")
        category = normalize_department_category(d.category, dept_id)
        cur.execute(f"INSERT INTO departments (id,name,hod,category,faculty,students,estd,pg) VALUES ({ph(8)})",
            (dept_id,d.name,d.hod,category,d.faculty,d.students,d.estd,d.pg))
    return {"message":"Department created","id":dept_id}

@app.put("/departments/{dept_id}")
def update_department(dept_id: str, d: DeptModel):
    with get_db() as conn:
        cur = conn.cursor()
        ensure_department_category_column(cur)
        cur.execute("SELECT id FROM departments WHERE id=?", (dept_id,))
        if not cur.fetchone(): raise HTTPException(404, "Department not found")
        category = normalize_department_category(d.category, dept_id)
        cur.execute(f"""
            UPDATE departments SET name=?,hod=?,category=?,faculty=?,students=?,estd=?,pg=?
            WHERE id=?
        """, (d.name,d.hod,category,d.faculty,d.students,d.estd,d.pg,dept_id))
    return {"message":"Updated"}

@app.delete("/departments/{dept_id}")
def delete_department(dept_id: str):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM departments WHERE id=?", (dept_id,))
        if cur.rowcount == 0: raise HTTPException(404, "Department not found")
    return {"message":"Deleted"}

# ═══════════════════════════════════════════════════════════════════════════
#  COURSES  — enrollment count synced
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/courses")
def get_courses(dept: Optional[str]=None):
    with get_db() as conn:
        cur = conn.cursor()
        q = "SELECT * FROM courses WHERE 1=1"
        params = []
        if dept: q += " AND dept=?"; params.append(dept)
        cur.execute(q, params)
        rows = rows_to_list(cur.fetchall())
    return {"total":len(rows),"courses":rows}

@app.post("/courses", status_code=201)
def create_course(c: CourseModel):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT code FROM courses WHERE code=?", (c.code,))
        if cur.fetchone(): raise HTTPException(409, "Course code already exists")
        # Validate department exists before INSERT (avoids FK constraint error)
        cur.execute("SELECT id FROM departments WHERE id=?", (c.dept,))
        if not cur.fetchone():
            raise HTTPException(400, f"Department '{c.dept}' does not exist. Please add it in the Departments section first.")
        # Try to resolve faculty_id
        cur.execute("SELECT id FROM staff WHERE name=?", (c.faculty,))
        frow = cur.fetchone()
        faculty_id = frow[0] if frow else None
        cur.execute(f"""
            INSERT INTO courses (code,name,dept,credits,type,faculty,faculty_id,sem,students,syllabus)
            VALUES ({ph(10)})
        """, (c.code,c.name,c.dept,c.credits,c.type,c.faculty,faculty_id,
              c.sem,c.students,c.syllabus))
    return {"message":"Course created"}

@app.put("/courses/{code}")
def update_course(code: str, c: CourseModel):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT code FROM courses WHERE code=?", (code,))
        if not cur.fetchone(): raise HTTPException(404, "Course not found")
        # Validate department exists
        cur.execute("SELECT id FROM departments WHERE id=?", (c.dept,))
        if not cur.fetchone():
            raise HTTPException(400, f"Department '{c.dept}' does not exist. Please add it in the Departments section first.")
        cur.execute("SELECT id FROM staff WHERE name=?", (c.faculty,))
        frow = cur.fetchone()
        faculty_id = frow[0] if frow else None
        cur.execute(f"""
            UPDATE courses SET name=?,dept=?,credits=?,type=?,faculty=?,
                faculty_id=?,sem=?,students=?,syllabus=?
            WHERE code=?
        """, (c.name,c.dept,c.credits,c.type,c.faculty,faculty_id,
              c.sem,c.students,c.syllabus,code))
    return {"message":"Updated"}

@app.delete("/courses/{code}")
def delete_course(code: str):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM courses WHERE code=?", (code,))
        if cur.rowcount == 0: raise HTTPException(404, "Course not found")
    return {"message":"Deleted"}

# ═══════════════════════════════════════════════════════════════════════════
#  EXAMS
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/exams")
def get_exams(status: Optional[str]=None):
    with get_db() as conn:
        cur = conn.cursor()
        q = "SELECT * FROM exams WHERE 1=1"
        params = []
        if status: q += " AND LOWER(status)=LOWER(?)"; params.append(status)
        cur.execute(q, params)
        rows = rows_to_list(cur.fetchall())
        cur.execute("SELECT dept, COUNT(*) FROM students WHERE status='Active' GROUP BY dept")
        dept_counts = {r[0]: r[1] for r in cur.fetchall()}
        cur.execute("SELECT COUNT(*) FROM students WHERE status='Active'")
        total_active = cur.fetchone()[0]
    for r in rows:
        r["hall_tickets"] = bool(r.get("hall_tickets", 0))
        dept = r.get("dept", "All")
        if dept == "All":
            r["total"] = total_active
        elif dept in dept_counts:
            r["total"] = dept_counts[dept]
    return {"total":len(rows),"exams":rows}

@app.post("/exams", status_code=201)
def create_exam(e: ExamModel):
    with get_db() as conn:
        cur = conn.cursor()
        if not e.id: e.id = next_id(cur, "exams", "E")
        cur.execute(f"""
            INSERT INTO exams (id,name,dept,type,date,status,total,hall_tickets)
            VALUES ({ph(8)})
        """, (e.id,e.name,e.dept,e.type,e.date,e.status,e.total,int(e.hall_tickets)))
    return {"message":"Exam scheduled","id":e.id}

@app.put("/exams/{exam_id}")
def update_exam(exam_id: str, e: ExamModel):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM exams WHERE id=?", (exam_id,))
        if not cur.fetchone(): raise HTTPException(404, "Exam not found")
        cur.execute(f"""
            UPDATE exams SET name=?,dept=?,type=?,date=?,status=?,total=?,hall_tickets=?
            WHERE id=?
        """, (e.name,e.dept,e.type,e.date,e.status,e.total,int(e.hall_tickets),exam_id))
    return {"message":"Updated"}

@app.delete("/exams/{exam_id}")
def delete_exam(exam_id: str):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM exams WHERE id=?", (exam_id,))
        if cur.rowcount == 0: raise HTTPException(404, "Exam not found")
    return {"message":"Deleted"}

# ═══════════════════════════════════════════════════════════════════════════
#  FEES  — auto-sync student_fees on new fee type
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/fees")
def get_fees():
    with get_db() as conn:
        cur = conn.cursor()
        ensure_fee_catalog(cur)
        ensure_all_student_fee_rows(cur)
        sync_fee_master_balances(cur)
        cur.execute("SELECT * FROM fees ORDER BY id")
        rows = [fee_row_payload(row) for row in rows_to_list(cur.fetchall())]
    return {"total_amount": sum(fee_amount(f, "amount") for f in rows), "fees": rows}

@app.post("/fees", status_code=201)
def create_fee(f: FeeModel):
    with get_db() as conn:
        cur = conn.cursor()
        if not f.id: f.id = next_id(cur, "fees", "F")
        cur.execute(f"""
            INSERT INTO fees (id,type,amount,freq,due_date,collected,pending)
            VALUES ({ph(7)})
        """, (f.id,f.type,f.amount,f.freq,f.due_date,f.collected,f.pending))
        # CASCADE: add ledger row for every existing student
        cur.execute("SELECT id FROM students")
        for srow in cur.fetchall():
            try:
                cur.execute(f"INSERT INTO student_fees (student_id,fee_id,amount_paid) VALUES ({ph(3)})",
                    (srow[0], f.id, 0))
            except Exception: pass
        sync_fee_master_balances(cur)
    return {"message":"Fee created","id":f.id}

@app.put("/fees/{fee_id}")
def update_fee(fee_id: str, f: FeeModel):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM fees WHERE id=?", (fee_id,))
        if not cur.fetchone(): raise HTTPException(404, "Fee not found")
        cur.execute(f"""
            UPDATE fees SET type=?,amount=?,freq=?,due_date=?,collected=?,pending=?
            WHERE id=?
        """, (f.type,f.amount,f.freq,f.due_date,f.collected,f.pending,fee_id))
        sync_fee_master_balances(cur)
    return {"message":"Updated"}

@app.delete("/fees/{fee_id}")
def delete_fee(fee_id: str):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM fees WHERE id=?", (fee_id,))
        if cur.rowcount == 0: raise HTTPException(404, "Fee not found")
    return {"message":"Deleted"}

# Student-wise fee detail endpoint
@app.get("/fees/student-details")
def get_student_fee_details(dept: Optional[str]=None, status: Optional[str]=None,
                             search: Optional[str]=None):
    with get_db() as conn:
        cur = conn.cursor()
        q = """
            SELECT s.id as studentId, s.name, s.dept, s.year, s.fee_status as status,
                   0 as paid, 0 as balance,
                   '2025-07-31' as dueDate
            FROM students s WHERE 1=1
        """
        params = []
        if dept:   q += " AND s.dept=?";                                    params.append(dept)
        if status: q += " AND LOWER(s.fee_status)=LOWER(?)";                params.append(status)
        if search:
            q += " AND (LOWER(s.name) LIKE LOWER(?) OR LOWER(s.id) LIKE LOWER(?))"
            params.extend([f"%{search}%", f"%{search}%"])
        cur.execute(q, params)
        rows = rows_to_list(cur.fetchall())
    return {"total":len(rows),"student_fees":rows}

# ═══════════════════════════════════════════════════════════════════════════
#  TRANSPORT
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/transport")
def get_routes():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM transport")
        rows = rows_to_list(cur.fetchall())
    return {"total":len(rows),"routes":rows}

@app.post("/transport", status_code=201)
def create_route(r: RouteModel):
    with get_db() as conn:
        cur = conn.cursor()
        if not r.id: r.id = next_id(cur, "transport", "R")
        cur.execute(f"""
            INSERT INTO transport (id,name,area,stops,students,driver,bus,time,contact)
            VALUES ({ph(9)})
        """, (r.id,r.name,r.area,r.stops,r.students,r.driver,r.bus,r.time,r.contact))
    return {"message":"Route created","id":r.id}

@app.put("/transport/{route_id}")
def update_route(route_id: str, r: RouteModel):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM transport WHERE id=?", (route_id,))
        if not cur.fetchone(): raise HTTPException(404, "Route not found")
        cur.execute(f"""
            UPDATE transport SET name=?,area=?,stops=?,students=?,driver=?,bus=?,time=?,contact=?
            WHERE id=?
        """, (r.name,r.area,r.stops,r.students,r.driver,r.bus,r.time,r.contact,route_id))
    return {"message":"Updated"}

@app.delete("/transport/{route_id}")
def delete_route(route_id: str):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM transport WHERE id=?", (route_id,))
        if cur.rowcount == 0: raise HTTPException(404, "Route not found")
    return {"message":"Deleted"}

# ═══════════════════════════════════════════════════════════════════════════
#  ATTENDANCE
# ═══════════════════════════════════════════════════════════════════════════

def attendance_query_filters(dept: Optional[str]=None, month: Optional[str]=None,
                             year: Optional[int]=None, student_id: Optional[str]=None,
                             subject: Optional[str]=None):
    q = "SELECT * FROM attendance WHERE 1=1"
    params = []
    if dept:       q += " AND dept=?";                        params.append(dept)
    if month:      q += " AND LOWER(month)=LOWER(?)";         params.append(month)
    if year:       q += " AND year=?";                        params.append(year)
    if student_id: q += " AND student_id=?";                  params.append(student_id)
    if subject is not None:
        if subject:
            q += " AND (COALESCE(subject, '')=COALESCE(?, '') OR COALESCE(subject, '')='')"
        else:
            q += " AND COALESCE(subject, '')=COALESCE(?, '')"
        params.append(subject)
    return q, params

@app.get("/attendance")
def get_attendance(dept: Optional[str]=None, month: Optional[str]=None,
                   year: Optional[int]=None, student_id: Optional[str]=None,
                   subject: Optional[str]=None):
    with get_db() as conn:
        cur = conn.cursor()
        q, params = attendance_query_filters(dept, month, year, student_id, subject)
        q += " ORDER BY date, id"
        cur.execute(q, params)
        rows = rows_to_list(cur.fetchall())
        excluded_students = []
        if dept and month:
            eq = """
                SELECT student_id
                FROM attendance_exclusions
                WHERE dept=? AND LOWER(month)=LOWER(?)
            """
            eparams = [dept, month]
            if year:
                eq += " AND year=?"
                eparams.append(year)
            if subject is not None:
                eq += " AND COALESCE(subject, '')=COALESCE(?, '')"
                eparams.append(subject)
            cur.execute(eq, eparams)
            excluded_students = [r[0] for r in cur.fetchall()]
    return {"total":len(rows),"records":rows,"excluded_students":excluded_students}

@app.get("/attendance/summary")
def get_attendance_summary(dept: Optional[str]=None, month: Optional[str]=None,
                           year: Optional[int]=None, student_id: Optional[str]=None,
                           subject: Optional[str]=None):
    with get_db() as conn:
        cur = conn.cursor()
        q, params = attendance_query_filters(dept, month, year, student_id, subject)
        cur.execute(q, params)
        rows = rows_to_list(cur.fetchall())

    present = sum(1 for row in rows if row.get("status") == "P")
    absent = sum(1 for row in rows if row.get("status") == "A")
    holiday = sum(1 for row in rows if row.get("status") == "H")
    tracked_students = len({row.get("student_id") for row in rows if row.get("student_id")})
    attendance_pct = round((present / (present + absent)) * 100, 1) if (present + absent) else 0

    return {
        "summary": {
            "total_records": len(rows),
            "students_tracked": tracked_students,
            "present_records": present,
            "absent_records": absent,
            "holiday_records": holiday,
            "attendance_pct": attendance_pct,
        }
    }

@app.delete("/attendance/{student_id}")
def delete_student_attendance(student_id: str, dept: Optional[str]=None, 
                               month: Optional[str]=None,
                               subject: Optional[str]=None,
                               year: Optional[int]=None):
    with get_db() as conn:
        cur = conn.cursor()
        q = "DELETE FROM attendance WHERE student_id=?"
        params = [student_id]
        if dept:  q += " AND dept=?";  params.append(dept)
        if month: q += " AND LOWER(month)=LOWER(?)"; params.append(month)
        if year:  q += " AND year=?"; params.append(year)
        if subject is not None:
            if subject:
                q += " AND (COALESCE(subject, '')=COALESCE(?, '') OR COALESCE(subject, '')='')"
            else:
                q += " AND COALESCE(subject, '')=COALESCE(?, '')"
            params.append(subject)
        cur.execute(q, params)
        deleted_rows = cur.rowcount
        if dept and month:
            try:
                cur.execute(
                    """
                    INSERT INTO attendance_exclusions (dept, subject, month, year, student_id)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(dept, subject, month, student_id) DO UPDATE SET year=excluded.year
                    """,
                    (dept, subject or "", month, year, student_id),
                )
            except Exception:
                pass
    return {"message": f"Attendance deleted for {student_id}", "rows": deleted_rows}

@app.post("/attendance", status_code=201)
def mark_attendance(a: AttModel):
    with get_db() as conn:
        cur = conn.cursor()
        clear_attendance_exclusion(cur, a.student_id, a.dept, a.month, a.subject)
        record_id = upsert_attendance_record(cur, a)
    return {"message":"Marked","id":record_id}

@app.post("/attendance/bulk", status_code=201)
def mark_bulk(records: List[AttModel]):
    with get_db() as conn:
        cur = conn.cursor()
        for a in records:
            clear_attendance_exclusion(cur, a.student_id, a.dept, a.month, a.subject)
            upsert_attendance_record(cur, a)
    return {"message":f"{len(records)} records saved"}

# ═══════════════════════════════════════════════════════════════════════════
#  CERTIFICATES
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/certificates")
def get_certs(student: Optional[str]=None, status: Optional[str]=None):
    with get_db() as conn:
        cur = conn.cursor()
        q = "SELECT * FROM certificates WHERE 1=1"
        params = []
        if student: q += " AND LOWER(student) LIKE LOWER(?)"; params.append(f"%{student}%")
        if status:  q += " AND LOWER(status)=LOWER(?)";       params.append(status)
        cur.execute(q, params)
        rows = rows_to_list(cur.fetchall())
    return {"total":len(rows),"certificates":rows}

@app.post("/certificates", status_code=201)
def create_cert(c: CertModel):
    with get_db() as conn:
        cur = conn.cursor()
        if not c.id: c.id = next_id(cur, "certificates", "C")
        verif = c.verif
        if c.status == "Issued" and verif in ("—", ""):
            cur.execute("SELECT COUNT(*) FROM certificates")
            n = cur.fetchone()[0]
            verif = f"VER-{datetime.now().year}-{str(n+1).zfill(3)}"
        # Resolve student_id
        cur.execute("SELECT id FROM students WHERE name=?", (c.student,))
        srow = cur.fetchone()
        student_id = srow[0] if srow else None
        cur.execute(f"""
            INSERT INTO certificates (id,type,student,student_id,date,status,verif)
            VALUES ({ph(7)})
        """, (c.id,c.type,c.student,student_id,c.date,c.status,verif))
    return {"message":"Issued","id":c.id,"verif":verif}

@app.put("/certificates/{cert_id}")
def update_cert(cert_id: str, c: CertModel):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM certificates WHERE id=?", (cert_id,))
        if not cur.fetchone(): raise HTTPException(404, "Certificate not found")
        cur.execute("SELECT id FROM students WHERE name=?", (c.student,))
        srow = cur.fetchone()
        student_id = srow[0] if srow else None
        cur.execute(f"""
            UPDATE certificates SET type=?,student=?,student_id=?,date=?,status=?,verif=?
            WHERE id=?
        """, (c.type,c.student,student_id,c.date,c.status,c.verif,cert_id))
    return {"message":"Updated"}

@app.delete("/certificates/{cert_id}")
def delete_cert(cert_id: str):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM certificates WHERE id=?", (cert_id,))
        if cur.rowcount == 0: raise HTTPException(404, "Certificate not found")
    return {"message":"Deleted"}

# ═══════════════════════════════════════════════════════════════════════════
#  PUBLICATIONS  — updates staff.publications count
# ═══════════════════════════════════════════════════════════════════════════

def _sync_staff_pub_count(cur, staff_id: str):
    cur.execute("SELECT COUNT(*) FROM publications WHERE staff_id=?", (staff_id,))
    n = cur.fetchone()[0]
    cur.execute("UPDATE staff SET publications=? WHERE id=?", (n, staff_id))

@app.get("/publications")
def get_pubs(type: Optional[str]=None):
    with get_db() as conn:
        cur = conn.cursor()
        q = "SELECT * FROM publications WHERE 1=1"
        params = []
        if type: q += " AND LOWER(type)=LOWER(?)"; params.append(type)
        cur.execute(q, params)
        rows = rows_to_list(cur.fetchall())
    for r in rows:
        if r.get("impact") is None: r["impact"] = "—"
    return {"total":len(rows),"publications":rows}

@app.post("/publications", status_code=201)
def create_pub(p: PubModel):
    impact_val = None if p.impact in ("—","-","","N/A") else float(p.impact)
    with get_db() as conn:
        cur = conn.cursor()
        if not p.id: p.id = next_id(cur, "publications", "P")
        cur.execute("SELECT id FROM staff WHERE name=?", (p.author,))
        srow = cur.fetchone()
        staff_id = srow[0] if srow else None
        cur.execute(f"""
            INSERT INTO publications (id,title,author,staff_id,journal,year,type,impact)
            VALUES ({ph(8)})
        """, (p.id,p.title,p.author,staff_id,p.journal,p.year,p.type,impact_val))
        # CASCADE: update staff publication count
        if staff_id:
            _sync_staff_pub_count(cur, staff_id)
    return {"message":"Added","id":p.id}

@app.put("/publications/{pub_id}")
def update_pub(pub_id: str, p: PubModel):
    impact_val = None if p.impact in ("—","-","","N/A") else float(p.impact)
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM publications WHERE id=?", (pub_id,))
        if not cur.fetchone(): raise HTTPException(404, "Publication not found")
        cur.execute("SELECT id FROM staff WHERE name=?", (p.author,))
        srow = cur.fetchone()
        staff_id = srow[0] if srow else None
        cur.execute(f"""
            UPDATE publications SET title=?,author=?,staff_id=?,journal=?,year=?,type=?,impact=?
            WHERE id=?
        """, (p.title,p.author,staff_id,p.journal,p.year,p.type,impact_val,pub_id))
        if staff_id: _sync_staff_pub_count(cur, staff_id)
    return {"message":"Updated"}

@app.delete("/publications/{pub_id}")
def delete_pub(pub_id: str):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT staff_id FROM publications WHERE id=?", (pub_id,))
        row = cur.fetchone()
        cur.execute("DELETE FROM publications WHERE id=?", (pub_id,))
        if cur.rowcount == 0: raise HTTPException(404, "Publication not found")
        if row and row[0]:
            _sync_staff_pub_count(cur, row[0])
    return {"message":"Deleted"}

# ═══════════════════════════════════════════════════════════════════════════
#  AICTE
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/aicte/checklist")
def get_aicte_checklist():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM aicte_checklist")
        rows = rows_to_list(cur.fetchall())
    return {"items":rows}

@app.post("/aicte/checklist", status_code=201)
def add_aicte_item(item: AICTEItemModel):
    with get_db() as conn:
        cur = conn.cursor()
        if not item.id: item.id = next_id(cur, "aicte_checklist", "AC")
        cur.execute(f"INSERT INTO aicte_checklist (id,cat,item,status,note) VALUES ({ph(5)})",
            (item.id,item.cat,item.item,item.status,item.note))
    return {"message":"Added","id":item.id}

@app.put("/aicte/checklist/{item_id}")
def update_aicte_item(item_id: str, item: AICTEItemModel):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM aicte_checklist WHERE id=?", (item_id,))
        if not cur.fetchone(): raise HTTPException(404, "Item not found")
        cur.execute(f"""
            UPDATE aicte_checklist SET cat=?,item=?,status=?,note=? WHERE id=?
        """, (item.cat,item.item,item.status,item.note,item_id))
    return {"message":"Updated"}

@app.delete("/aicte/checklist/{item_id}")
def delete_aicte_item(item_id: str):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM aicte_checklist WHERE id=?", (item_id,))
        if cur.rowcount == 0: raise HTTPException(404, "Item not found")
    return {"message":"Deleted"}

@app.get("/aicte/inspections")
def get_inspections():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM aicte_inspections ORDER BY date")
        rows = rows_to_list(cur.fetchall())
    return {"items":rows}

@app.post("/aicte/inspections", status_code=201)
def add_inspection(item: InspectionModel):
    with get_db() as conn:
        cur = conn.cursor()
        if not item.id: item.id = next_id(cur, "aicte_inspections", "IN")
        cur.execute(f"INSERT INTO aicte_inspections (id,date,title,body,color) VALUES ({ph(5)})",
            (item.id,item.date,item.title,item.body,item.color))
    return {"message":"Added","id":item.id}

@app.get("/aicte/institution")
def get_institution():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM aicte_institution")
        rows = rows_to_list(cur.fetchall())
    return {"records":rows}

# ═══════════════════════════════════════════════════════════════════════════
#  BATCHES
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/batches")
def get_batches_list(year: Optional[str]=None):
    with get_db() as conn:
        cur = conn.cursor()
        q = "SELECT * FROM batches WHERE 1=1"
        params = []
        if year: q += " AND year=?"; params.append(year)
        q += " ORDER BY year DESC"
        cur.execute(q, params)
        rows = rows_to_list(cur.fetchall())
    return {"total":len(rows),"batches":rows}

@app.post("/batches", status_code=201)
def create_batch(b: BatchModel):
    with get_db() as conn:
        cur = conn.cursor()
        if not b.id: b.id = next_id(cur, "batches", "B")
        cur.execute(f"INSERT INTO batches (id,year,dept,students,mentor) VALUES ({ph(5)})",
            (b.id,b.year,b.dept,b.students,b.mentor))
    return {"message":"Batch created","id":b.id}

@app.put("/batches/{batch_id}")
def update_batch(batch_id: str, b: BatchModel):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM batches WHERE id=?", (batch_id,))
        if not cur.fetchone(): raise HTTPException(404, "Batch not found")
        cur.execute(f"""
            UPDATE batches SET year=?,dept=?,students=?,mentor=? WHERE id=?
        """, (b.year,b.dept,b.students,b.mentor,batch_id))
    return {"message":"Updated"}

@app.delete("/batches/{batch_id}")
def delete_batch(batch_id: str):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM batches WHERE id=?", (batch_id,))
        if cur.rowcount == 0: raise HTTPException(404, "Batch not found")
    return {"message":"Deleted"}

# ═══════════════════════════════════════════════════════════════════════════
#  ALERTS
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/alerts")
def get_alerts():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM alerts ORDER BY date DESC")
        rows = rows_to_list(cur.fetchall())
    return {"total":len(rows),"alerts":rows}

@app.post("/alerts", status_code=201)
def create_alert(a: AlertModel):
    with get_db() as conn:
        cur = conn.cursor()
        if not a.id: a.id = next_id(cur, "alerts", "ALR")
        if not a.date: a.date = datetime.now().strftime("%Y-%m-%d")
        cur.execute(f"INSERT INTO alerts (id,title,message,type,date) VALUES ({ph(5)})",
            (a.id,a.title,a.message,a.type,a.date))
    return {"message":"Alert created","id":a.id}

@app.put("/alerts/{alert_id}")
def update_alert(alert_id: str, a: AlertModel):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM alerts WHERE id=?", (alert_id,))
        if not cur.fetchone():
            raise HTTPException(404, "Alert not found")
        alert_date = a.date or datetime.now().strftime("%Y-%m-%d")
        cur.execute(
            "UPDATE alerts SET title=?, message=?, type=?, date=? WHERE id=?",
            (a.title, a.message, a.type, alert_date, alert_id),
        )
    return {"message":"Updated","id":alert_id}

@app.delete("/alerts/{alert_id}")
def delete_alert(alert_id: str):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM alerts WHERE id=?", (alert_id,))
        if cur.rowcount == 0: raise HTTPException(404, "Alert not found")
    return {"message":"Deleted"}

# ═══════════════════════════════════════════════════════════════════════════
#  REPORTS
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/reports/student-analytics")
def report_student_analytics():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM students")
        students = rows_to_list(cur.fetchall())
    total  = len(students)
    active = len([s for s in students if s.get("status") == "Active"])
    dept_dist, year_dist, gender_dist = {}, {}, {}
    fee_status = {"Paid":0,"Pending":0,"Overdue":0}
    cgpa_bands = {"9-10":0,"8-9":0,"7-8":0,"6-7":0,"Below 6":0}
    cgpa_values = []
    for s in students:
        d  = s.get("dept","?");    dept_dist[d]   = dept_dist.get(d, 0) + 1
        y  = str(s.get("year","")); year_dist[y]  = year_dist.get(y, 0) + 1
        g  = s.get("gender","");   gender_dist[g] = gender_dist.get(g, 0) + 1
        fs = s.get("fee_status","")
        if fs in fee_status: fee_status[fs] += 1
        try:
            cgpa = float(s.get("cgpa",0)); cgpa_values.append(cgpa)
            if   cgpa >= 9: cgpa_bands["9-10"]    += 1
            elif cgpa >= 8: cgpa_bands["8-9"]     += 1
            elif cgpa >= 7: cgpa_bands["7-8"]     += 1
            elif cgpa >= 6: cgpa_bands["6-7"]     += 1
            else:           cgpa_bands["Below 6"] += 1
        except Exception: pass
    avg_cgpa = round(sum(cgpa_values)/len(cgpa_values),2) if cgpa_values else 0
    return {"title":"Student Analytics Report","generated_at":datetime.now().isoformat(),
            "summary":{"total_students":total,"active":active,"inactive":total-active,
                        "average_cgpa":avg_cgpa},
            "dept_distribution":dept_dist,"year_distribution":year_dist,
            "gender_distribution":gender_dist,"fee_status_distribution":fee_status,
            "cgpa_bands":cgpa_bands}

@app.get("/reports/financial")
def report_financial():
    with get_db() as conn:
        cur = conn.cursor()
        # Use student-level fee data (the source of truth after removing fee structure tab)
        cur.execute("""SELECT id, name, dept, year, fee_status,
                              paid AS fees_paid, balance AS fees_due,
                              tuition, hostel, transport_fee, lab, exam, library,
                              sports, development, admission, alumni_fee, medical,
                              placement, it_infra, miscellaneous,
                              due_date AS fee_due_date
                       FROM students ORDER BY dept, name""")
        students = rows_to_list(cur.fetchall())

    fee_rows = []
    for s in students:
        paid = max(0.0, fee_amount(s, "fees_paid"))
        stored_due = max(0.0, fee_amount(s, "fees_due"))
        component_total = fee_total(s)
        total = component_total if component_total > 0 else paid + stored_due
        collected = min(paid, total) if total > 0 else paid
        due = max(0.0, total - collected) if total > 0 else stored_due
        fee_rows.append({**s, "_paid": collected, "_due": due, "_total": total})

    total_collected = sum(s["_paid"] for s in fee_rows)
    total_pending   = sum(s["_due"] for s in fee_rows)
    total_amount    = sum(s["_total"] for s in fee_rows)
    recovery_pct    = round(total_collected / total_amount * 100, 1) if total_amount else 0

    # Fee component breakdown aggregated from all students
    fee_breakdown = []
    for label, key in FEE_COMPONENTS:
        total = sum(max(0.0, fee_amount(s, key)) for s in fee_rows)
        collected = sum(
            max(0.0, fee_amount(s, key)) * (s["_paid"] / s["_total"])
            for s in fee_rows
            if s["_total"] > 0 and fee_amount(s, key) > 0
        )
        pending = total - collected
        fee_breakdown.append({
            "type": label,
            "amount": round(total, 2),
            "collected": round(collected, 2),
            "pending": round(pending, 2),
            "recovery_pct": round(collected / total * 100, 1) if total else 0,
        })

    # Dept-wise collection
    dept_collection = {}
    for s in fee_rows:
        d = s.get("dept", "Other")
        dept_collection[d] = dept_collection.get(d, 0) + s["_paid"]
    dept_collection = {k: round(v) for k, v in sorted(dept_collection.items(), key=lambda x: -x[1])}

    # Student-wise fee report table
    student_table = [{
        "id": s.get("id", ""), "name": s.get("name", ""), "dept": s.get("dept", ""),
        "year": s.get("year", ""), "fee_status": s.get("fee_status", ""),
        "paid": round(s["_paid"]), "due": round(s["_due"]),
        "total": round(s["_total"]),
        "due_date": s.get("fee_due_date", ""),
    } for s in fee_rows]

    fee_statuses = [s.get("fee_status", "") for s in fee_rows]
    return {"title": "Financial Report", "generated_at": datetime.now().isoformat(),
            "summary": {"total_receivable": round(total_amount, 2), "total_collected": round(total_collected, 2),
                        "total_pending": round(total_pending, 2), "recovery_percentage": recovery_pct,
                        "total_students": len(students)},
            "fee_breakdown": fee_breakdown,
            "dept_collection": dept_collection,
            "student_table": student_table,
            "student_fee_status": {"Paid": fee_statuses.count("Paid"),
                                   "Pending": fee_statuses.count("Pending"),
                                   "Overdue": fee_statuses.count("Overdue")}}

@app.get("/reports/exam-results")
def report_exam_results():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM exams")
        exams = rows_to_list(cur.fetchall())
        cur.execute("SELECT cgpa FROM students")
        cgpa_rows = [r[0] for r in cur.fetchall()]
    for e in exams: e["hall_tickets"] = bool(e.get("hall_tickets",0))
    type_dist = {}
    for e in exams:
        t = e.get("type","Other"); type_dist[t] = type_dist.get(t,0) + 1
    cgpa_bands = {"Distinction (≥9)":0,"First Class (8-9)":0,
                  "Second Class (7-8)":0,"Pass (6-7)":0,"Fail (<6)":0}
    for cgpa in cgpa_rows:
        try:
            v = float(cgpa)
            if   v >= 9: cgpa_bands["Distinction (≥9)"]   += 1
            elif v >= 8: cgpa_bands["First Class (8-9)"]  += 1
            elif v >= 7: cgpa_bands["Second Class (7-8)"] += 1
            elif v >= 6: cgpa_bands["Pass (6-7)"]         += 1
            else:        cgpa_bands["Fail (<6)"]           += 1
        except Exception: pass
    return {"title":"Examination Results Report","generated_at":datetime.now().isoformat(),
            "summary":{"total_exams":len(exams),
                        "completed":len([e for e in exams if e.get("status")=="Completed"]),
                        "upcoming":len([e for e in exams if e.get("status") in ("Upcoming","Scheduled")]),
                        "hall_tickets_issued":len([e for e in exams if e.get("hall_tickets")])},
            "exam_type_distribution":type_dist,"student_performance_bands":cgpa_bands,"exams":exams}

@app.get("/reports/attendance")
def report_attendance():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT student_id, student_name, dept, status FROM attendance")
        records = cur.fetchall()
    if not records:
        return {"title":"Attendance Report","generated_at":datetime.now().isoformat(),
                "note":"No attendance records are saved in the database yet. Mark attendance from Attendance Management and save it to generate this report.",
                "summary":{"total_records":0,"students_tracked":0,"shortage_count":0},
                "dept_summary":[],"shortage_students":[]}
    student_att = {}
    for r in records:
        sid = r[0]
        if sid not in student_att:
            student_att[sid] = {"name":r[1],"dept":r[2],"P":0,"A":0,"H":0}
        s = r[3]
        if s in student_att[sid]: student_att[sid][s] += 1
    dept_summary = {}; shortage = []
    for sid, data in student_att.items():
        total = data["P"] + data["A"]
        pct   = round(data["P"]/total*100,1) if total else 0
        dept  = data["dept"]
        if dept not in dept_summary:
            dept_summary[dept] = {"dept":dept,"total_students":0,"avg_pct_sum":0}
        dept_summary[dept]["total_students"] += 1
        dept_summary[dept]["avg_pct_sum"]   += pct
        if pct < 75:
            shortage.append({"student_id":sid,"name":data["name"],"dept":dept,"attendance_pct":pct})
    for d in dept_summary.values():
        d["avg_attendance"] = round(d["avg_pct_sum"]/d["total_students"],1) if d["total_students"] else 0
        del d["avg_pct_sum"]
    return {"title":"Attendance Report","generated_at":datetime.now().isoformat(),
            "summary":{"total_records":len(records),"students_tracked":len(student_att),
                        "shortage_count":len(shortage)},
            "dept_summary":list(dept_summary.values()),"shortage_students":shortage}

@app.get("/reports/research")
def report_research():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM publications")
        pubs = rows_to_list(cur.fetchall())
    for p in pubs:
        if p.get("impact") is None: p["impact"] = "—"
    type_dist={}; impact_values=[]; year_dist={}; author_dist={}
    for p in pubs:
        t=p.get("type","Other"); type_dist[t]=type_dist.get(t,0)+1
        try: impact_values.append(float(p.get("impact",0)))
        except Exception: pass
        yr=str(p.get("year","")); year_dist[yr]=year_dist.get(yr,0)+1
        a=p.get("author","?"); author_dist[a]=author_dist.get(a,0)+1
    return {"title":"Research Output Report","generated_at":datetime.now().isoformat(),
            "summary":{"total_publications":len(pubs),
                        "journal_papers":len([p for p in pubs if p.get("type")=="Journal"]),
                        "avg_impact_factor":round(sum(impact_values)/len(impact_values),2) if impact_values else 0},
            "type_distribution":type_dist,"year_wise":year_dist,
            "author_contributions":author_dist,"publications":pubs}

@app.get("/reports/aicte")
def report_aicte():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM students")
        students = rows_to_list(cur.fetchall())
        cur.execute("SELECT * FROM staff WHERE type='Teaching'")
        teaching = rows_to_list(cur.fetchall())
        cur.execute("SELECT * FROM staff")
        all_staff = rows_to_list(cur.fetchall())
        cur.execute("SELECT COUNT(*) FROM publications")
        total_pubs = cur.fetchone()[0]
        # Query the aicte_institution table for institution details
        try:
            cur.execute("SELECT key, value FROM aicte_institution")
            institution_rows = [{"label": r[0], "value": r[1]} for r in cur.fetchall()]
        except Exception:
            institution_rows = []
        # Query aicte_checklist for any stored compliance items
        try:
            cur.execute("SELECT item, status, note FROM aicte_checklist")
            db_checklist = rows_to_list(cur.fetchall())
        except Exception:
            db_checklist = []
    phd_count = len([s for s in teaching if s.get("qual") == "Ph.D."])
    phd_pct   = round(phd_count / len(teaching) * 100, 1) if teaching else 0
    fs_ratio  = round(len(students) / len(teaching), 1)   if teaching else 0
    # Build checklist: start from dynamic DB entries, then append computed ones
    checklist = []
    for item in db_checklist:
        checklist.append({
            "item":   item.get("item", ""),
            "status": item.get("status", "warn"),
            "value":  item.get("note") or "—",
        })
    # Always include these computed compliance items
    checklist += [
        {"item": "Faculty:Student Ratio ≤ 1:15", "status": "warn" if fs_ratio > 15 else "ok",  "value": f"1:{fs_ratio}"},
        {"item": "≥ 60% Ph.D. Faculty",          "status": "ok"   if phd_pct >= 60 else "warn", "value": f"{phd_pct}%"},
        {"item": "NAAC Accreditation",            "status": "warn", "value": "Renewal due"},
        {"item": "AICTE Annual Report",           "status": "warn", "value": "Upload pending"},
    ]
    compliance_score = round(
        len([c for c in checklist if c["status"] == "ok"]) / len(checklist) * 100, 1
    ) if checklist else 0

    # Dept-wise faculty breakdown
    dept_faculty = {}
    for s in all_staff:
        d = s.get("dept", "?")
        dept_faculty[d] = dept_faculty.get(d, 0) + 1

    return {
        "title": "AICTE Compliance & Data Sheet",
        "generated_at": datetime.now().isoformat(),
        "summary": {
            "total_students":   len(students),
            "total_faculty":    len(teaching),
            "total_staff":      len(all_staff),
            "fs_ratio":         f"1:{fs_ratio}",
            "phd_percentage":   phd_pct,
            "compliance_score": compliance_score,
        },
        "checklist":            checklist,
        "total_publications":   total_pubs,
        "dept_faculty":         dept_faculty,
        "institution":          institution_rows,
    }

# ═══════════════════════════════════════════════════════════════════════════
#  EXPORT
# ═══════════════════════════════════════════════════════════════════════════

EXPORT_MAP = {
    "students":     ("SELECT * FROM students",     ["id","name","dept","year","batch","gender","dob","phone","email","status","cgpa","fee_status","transport","guardian","address"]),
    "staff":        ("SELECT * FROM staff",        ["id","name","dept","role","type","qual","exp","publications","status","email","phone"]),
    "courses":      ("SELECT * FROM courses",      ["code","name","dept","credits","type","faculty","sem","students","syllabus"]),
    "exams":        ("SELECT * FROM exams",        ["id","name","dept","type","date","status","total","hall_tickets"]),
    "fees":         ("SELECT * FROM fees",         ["id","type","amount","freq","due_date","collected","pending"]),
    "transport":    ("SELECT * FROM transport",    ["id","name","area","stops","students","driver","bus","time","contact"]),
    "alumni":       ("SELECT * FROM alumni",       ["id","name","dept","batch","phone","email","employer","jobTitle","workCity","sector","passYear","cgpa","gender","address"]),
    "attendance":   ("SELECT * FROM attendance",   ["id","student_id","student_name","dept","date","status","month","year"]),
    "certificates": ("SELECT * FROM certificates", ["id","type","student","date","status","verif"]),
    "publications": ("SELECT * FROM publications", ["id","title","author","journal","year","type","impact"]),
    "batches":      ("SELECT * FROM batches",      ["id","year","dept","students","mentor"]),
    "departments":  ("SELECT * FROM departments",  ["id","name","hod","category","faculty","students","estd","pg"]),
}

def csv_stream(rows, fieldnames, filename):
    def gen():
        buf = io.StringIO()
        w = csv.DictWriter(buf, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        for r in rows: w.writerow(r)
        yield buf.getvalue()
    return StreamingResponse(gen(), media_type="text/csv",
                             headers={"Content-Disposition":f"attachment; filename={filename}"})

@app.get("/export/{section}")
def export_section(section: str):
    if section not in EXPORT_MAP: raise HTTPException(400, f"Unknown section: {section}")
    query, fields = EXPORT_MAP[section]
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(query)
        rows = rows_to_list(cur.fetchall())
    return csv_stream(rows, fields, f"{section}_export.csv")

# ═══════════════════════════════════════════════════════════════════════════
#  UPLOAD
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/upload/{section}")
async def upload_file(section: str, request: Request):
    try:
        form = await request.form()
    except (AssertionError, RuntimeError) as exc:
        raise HTTPException(500, "File uploads require the optional python-multipart package.") from exc
    file = form.get("file")
    if file is None or not getattr(file, "filename", None):
        raise HTTPException(400, "Missing upload file")
    section_dir = os.path.join(UPLOADS, section)
    os.makedirs(section_dir, exist_ok=True)
    fname   = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    content = await file.read()
    with open(os.path.join(section_dir, fname), "wb") as f:
        f.write(content)
    if file.filename.endswith(".csv"):
        reader   = csv.DictReader(io.StringIO(content.decode("utf-8", errors="ignore")))
        imported = list(reader)
        return {"message":f"Uploaded & parsed: {len(imported)} rows","filename":fname,"rows":len(imported)}
    return {"message":"File uploaded","filename":fname,"size":len(content)}

# ═══════════════════════════════════════════════════════════════════════════
#  RESEED (dev utility)
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/seed")
def reseed():
    if not ENABLE_RESEED_ROUTE:
        raise HTTPException(403, "Database reseed route is disabled. Enable it explicitly with ENABLE_RESEED_ROUTE=true.")
    try:
        import erp_db_setup
        conn_s = erp_db_setup.get_connection()
        tables = ["course_enrollment","student_fees","publications","certificates",
                  "attendance","exams","fees","courses","staff","students","alumni",
                  "departments","transport","batches","aicte_checklist",
                  "aicte_inspections","aicte_institution","alerts"]
        cur = conn_s.cursor()
        for t in tables:
            try: cur.execute(f"DELETE FROM {t}")
            except Exception: pass
        conn_s.commit()
        erp_db_setup.seed_departments(conn_s)
        erp_db_setup.seed_students(conn_s)
        erp_db_setup.seed_staff(conn_s)
        erp_db_setup.seed_courses(conn_s)
        erp_db_setup.seed_attendance(conn_s)
        erp_db_setup.seed_exams(conn_s)
        erp_db_setup.seed_fees(conn_s)
        erp_db_setup.seed_certificates(conn_s)
        erp_db_setup.seed_publications(conn_s)
        conn_s.commit()
        conn_s.close()
        with get_db() as conn:
            cur2 = conn.cursor()
            _seed_extra_if_empty(cur2)
            backfill_course_enrollments(cur2)
        return {"message":"Database re-seeded successfully"}
    except Exception as e:
        raise HTTPException(500, f"Seed failed: {str(e)}")
