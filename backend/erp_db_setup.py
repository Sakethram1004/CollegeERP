"""
erp_db_setup.py
===============
Vidyasagar University ERP — Complete Database Setup & CSV Migration
--------------------------------------------------------------------
WHAT THIS FILE DOES:
  1.  Creates all 8 core tables with correct column types, constraints,
      and foreign keys (matching your CSV headers exactly).
  2.  Adds the 3 missing FK columns identified in the schema review
      (certificates.student_id, courses.faculty_id, attendance.course_code).
  3.  Adds subject / course_code to attendance (frontend tracks per-subject).
  4.  Inserts all 8 uploaded CSVs with data-cleaning:
        - Normalises attendance.month  →  "Jan 2025" format
        - Normalises attendance.id     →  AT0001 format
        - Converts exams.hall_tickets  →  proper Python bool → INTEGER 0/1
        - Converts publications.impact →  NULL where "—"
        - Clamps students.cgpa         →  0.00–10.00 (fixes rogue row S017 cgpa=39)
        - Fills students.paid / balance → 0.0 where blank
        - Resolves certificates.student_id via name-lookup
        - Resolves courses.faculty_id  via name-lookup
  5.  Creates 2 recommended junction tables:
        - student_fees   (student ↔ fee type ledger)
        - course_enrollment (student ↔ course)
  6.  Runs a verification query on every table at the end.

HOW TO USE:
  pip install sqlite3           ← already in stdlib, nothing to install

  # SQLite (zero-config, great for dev)
  python erp_db_setup.py

  # Switch to PostgreSQL: change DB_TYPE = "postgres" and fill PG_* below.
  # Switch to MySQL:      change DB_TYPE = "mysql"    and fill MY_* below.

REQUIREMENTS:
  - Python 3.8+
  - For PostgreSQL: pip install psycopg2-binary
  - For MySQL:      pip install mysql-connector-python
  - CSV files in the same folder as this script  (or update CSV_DIR below)

DATABASE SUPPORT:
  DB_TYPE = "sqlite"    → writes  erp_university.db  in current folder
  DB_TYPE = "postgres"  → connects to PostgreSQL
  DB_TYPE = "mysql"     → connects to MySQL / MariaDB
"""

import csv
import os
import re
import sqlite3
from datetime import datetime
from pathlib import Path

# ─────────────────────────────────────────────────────────────────────────────
# ❶  CONFIGURATION  —  edit these before running
# ─────────────────────────────────────────────────────────────────────────────

DB_TYPE = "sqlite"          # "sqlite" | "postgres" | "mysql"

# SQLite  ── only used when DB_TYPE = "sqlite"
SQLITE_PATH = os.getenv("SQLITE_PATH", os.path.join(os.path.dirname(os.path.abspath(__file__)), "erp_university.db"))

# PostgreSQL  ── only used when DB_TYPE = "postgres"
PG_HOST     = "localhost"
PG_PORT     = 5432
PG_DBNAME   = "erp_university"
PG_USER     = "postgres"
PG_PASSWORD = "yourpassword"

# MySQL / MariaDB  ── only used when DB_TYPE = "mysql"
MY_HOST     = "localhost"
MY_PORT     = 3306
MY_DBNAME   = "erp_university"
MY_USER     = "root"
MY_PASSWORD = "yourpassword"

# Path to folder that contains all 8 CSV files
CSV_DIR = Path(__file__).parent / "data"
# If your CSVs are elsewhere, set e.g.:
# CSV_DIR = Path("/home/yourname/uploads")

# ─────────────────────────────────────────────────────────────────────────────
# ❷  DB CONNECTION FACTORY
# ─────────────────────────────────────────────────────────────────────────────

def get_connection():
    """Return a DB-API 2.0 connection based on DB_TYPE."""
    if DB_TYPE == "sqlite":
        conn = sqlite3.connect(SQLITE_PATH)
        conn.execute("PRAGMA foreign_keys = ON")   # enable FK enforcement
        conn.execute("PRAGMA journal_mode = WAL")  # better concurrency
        return conn

    elif DB_TYPE == "postgres":
        import psycopg2
        return psycopg2.connect(
            host=PG_HOST, port=PG_PORT,
            dbname=PG_DBNAME, user=PG_USER, password=PG_PASSWORD
        )

    elif DB_TYPE == "mysql":
        import mysql.connector
        return mysql.connector.connect(
            host=MY_HOST, port=MY_PORT,
            database=MY_DBNAME, user=MY_USER, password=MY_PASSWORD
        )

    else:
        raise ValueError(f"Unknown DB_TYPE: {DB_TYPE!r}")


def placeholder(n=1):
    """
    Return the right parameter placeholder for the active DB.
      SQLite / MySQL  →  ?
      PostgreSQL      →  %s
    """
    if DB_TYPE == "postgres":
        return ", ".join(["%s"] * n)
    return ", ".join(["?"] * n)


def ph():
    """Single placeholder."""
    return "%s" if DB_TYPE == "postgres" else "?"


# ─────────────────────────────────────────────────────────────────────────────
# ❸  DDL  —  CREATE TABLES
# ─────────────────────────────────────────────────────────────────────────────

# Note: SQLite uses TEXT for all string-like types; Postgres/MySQL honour
# VARCHAR(n). The DDL below is written in SQLite dialect — for
# Postgres/MySQL you can swap TEXT → VARCHAR(n) as indicated in comments.

DDL_STATEMENTS = [

    # ── departments ──────────────────────────────────────────────────────────
    # Not in the uploaded CSVs but required as the root reference table.
    # Seeded from the DEPTS constant in the frontend.
    """
    CREATE TABLE IF NOT EXISTS departments (
        id          TEXT PRIMARY KEY,          -- e.g. CSE, ECE, ME … also ADM, LIB, HUM
        name        TEXT NOT NULL,
        hod         TEXT,                      -- soft ref → staff.name (no FK to avoid circular dep)
        category    TEXT DEFAULT 'Academic'
                        CHECK(category IN ('Academic','Administrative')),
        faculty     INTEGER DEFAULT 0,
        students    INTEGER DEFAULT 0,
        estd        INTEGER,                   -- founding year
        pg          TEXT                       -- PG programmes offered
    )
    """,

    # ── students ─────────────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS students (
        id            TEXT PRIMARY KEY,
        name          TEXT NOT NULL,
        dept          TEXT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
        year          INTEGER NOT NULL,
        batch         INTEGER NOT NULL,
        gender        TEXT CHECK(gender IN ('Male','Female','Other')),
        dob           TEXT,
        phone         TEXT,
        email         TEXT UNIQUE,
        status        TEXT NOT NULL DEFAULT 'Active'
                          CHECK(status IN ('Active','Inactive','Alumni')),
        cgpa          REAL CHECK(cgpa >= 0 AND cgpa <= 10),
        fee_status    TEXT DEFAULT 'Pending'
                          CHECK(fee_status IN ('Paid','Pending','Overdue')),
        transport     TEXT,
        guardian      TEXT,
        address       TEXT,
        tuition       REAL DEFAULT 0,
        hostel        REAL DEFAULT 0,
        transport_fee REAL DEFAULT 0,
        lab           REAL DEFAULT 0,
        exam          REAL DEFAULT 0,
        library       REAL DEFAULT 0,
        sports        REAL DEFAULT 0,
        development   REAL DEFAULT 0,
        admission     REAL DEFAULT 0,
        alumni_fee    REAL DEFAULT 0,
        medical       REAL DEFAULT 0,
        placement     REAL DEFAULT 0,
        it_infra      REAL DEFAULT 0,
        miscellaneous REAL DEFAULT 0,
        paid          REAL DEFAULT 0,
        balance       REAL DEFAULT 0,
        due_date      TEXT DEFAULT '2025-07-31'
    )
    """,

    # ── staff ────────────────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS staff (
        id           TEXT PRIMARY KEY,         -- T001 (Teaching) or SP001 (Support)
        name         TEXT NOT NULL,
        dept         TEXT REFERENCES departments(id) ON DELETE SET NULL,
        role         TEXT NOT NULL,
        type         TEXT NOT NULL CHECK(type IN ('Teaching','Support')),
        qual         TEXT,                     -- Ph.D. | M.Tech | MBA | MLIS | B.Tech | MCA …
        exp          INTEGER DEFAULT 0,        -- years of experience
        publications INTEGER DEFAULT 0,        -- denormalised count (auto-sync recommended)
        status       TEXT DEFAULT 'Active'
                         CHECK(status IN ('Active','On Leave','Inactive')),
        email        TEXT UNIQUE,
        phone        TEXT
    )
    """,

    # ── courses ───────────────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS courses (
        code        TEXT PRIMARY KEY,          -- CS601, EC401 …
        name        TEXT NOT NULL,
        dept        TEXT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
        credits     INTEGER NOT NULL,
        type        TEXT NOT NULL CHECK(type IN ('Core','Elective','Mandatory','Lab')),
        faculty     TEXT,                      -- display name cache (source: staff.name)
        faculty_id  TEXT REFERENCES staff(id) ON DELETE SET NULL,  -- ← ADDED FK
        sem         INTEGER NOT NULL,          -- 1–8
        students    INTEGER DEFAULT 0,         -- denormalised enrolment count
        syllabus    TEXT
    )
    """,

    # ── attendance ───────────────────────────────────────────────────────────
    # One row = one student on one date (optionally per subject/course).
    """
    CREATE TABLE IF NOT EXISTS attendance (
        id           TEXT PRIMARY KEY,         -- AT0001 … standardised format
        student_id   TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        student_name TEXT,                     -- denormalised display cache
        dept         TEXT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
        date         TEXT NOT NULL,            -- YYYY-MM-DD
        status       TEXT NOT NULL CHECK(status IN ('P','A','H')),
        month        TEXT,                     -- "Jan 2025" (MMM YYYY)
        year         INTEGER,
        subject      TEXT,                     -- ← ADDED: subject name e.g. "Data Structures"
        course_code  TEXT REFERENCES courses(code) ON DELETE SET NULL  -- ← ADDED FK
    )
    """,

    # ── exams ─────────────────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS exams (
        id            TEXT PRIMARY KEY,        -- E001 …
        name          TEXT NOT NULL,
        dept          TEXT,                    -- "All" or dept code — not a FK (special sentinel)
        type          TEXT NOT NULL
                          CHECK(type IN ('Semester','Mid Term','Internal','Supplementary','Practical')),
        date          TEXT NOT NULL,           -- YYYY-MM-DD
        status        TEXT NOT NULL DEFAULT 'Scheduled'
                          CHECK(status IN ('Scheduled','Upcoming','Ongoing','Completed')),
        total         INTEGER DEFAULT 0,       -- students appearing
        hall_tickets  INTEGER DEFAULT 0        -- BOOLEAN: 0 = false, 1 = true
    )
    """,

    # ── fees ─────────────────────────────────────────────────────────────────
    # Institution-level fee structure (not per-student).
    """
    CREATE TABLE IF NOT EXISTS fees (
        id         TEXT PRIMARY KEY,           -- F001 …
        type       TEXT NOT NULL,              -- Tuition Fee | Hostel Fee …
        amount     REAL NOT NULL,
        freq       TEXT NOT NULL
                       CHECK(freq IN ('Annual','Semester','Monthly','One-time')),
        due_date   TEXT,                       -- YYYY-MM-DD
        collected  REAL DEFAULT 0,
        pending    REAL DEFAULT 0
    )
    """,

    # ── certificates ─────────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS certificates (
        id          TEXT PRIMARY KEY,          -- C001 …
        type        TEXT NOT NULL,             -- Degree Certificate | Bonafide …
        student     TEXT,                      -- display name cache
        student_id  TEXT REFERENCES students(id) ON DELETE RESTRICT,  -- ← ADDED FK
        date        TEXT NOT NULL,             -- YYYY-MM-DD
        status      TEXT NOT NULL DEFAULT 'Pending'
                        CHECK(status IN ('Pending','Issued')),
        verif       TEXT                       -- VER-YYYY-NNN or NULL
    )
    """,

    # ── publications ─────────────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS publications (
        id        TEXT PRIMARY KEY,            -- P001 …
        title     TEXT NOT NULL,
        author    TEXT NOT NULL,               -- display name cache (source: staff.name)
        staff_id  TEXT REFERENCES staff(id) ON DELETE SET NULL,  -- ← ADDED FK
        journal   TEXT,
        year      INTEGER NOT NULL,
        type      TEXT NOT NULL
                      CHECK(type IN ('Journal','Conference','Book Chapter','Patent')),
        impact    REAL                         -- NULL where not applicable (was "—" in CSV)
    )
    """,

    # ── junction: student_fees ───────────────────────────────────────────────
    # Per-student payment ledger — replaces denormalised fees_paid / fees_due
    # on the students table (keep those columns for backward compat but
    # use this table as source of truth once populated).
    """
    CREATE TABLE IF NOT EXISTS student_fees (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id  TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        fee_id      TEXT NOT NULL REFERENCES fees(id) ON DELETE RESTRICT,
        amount_paid REAL DEFAULT 0,
        paid_date   TEXT,                      -- YYYY-MM-DD
        receipt_no  TEXT,
        UNIQUE(student_id, fee_id)
    )
    """,

    # ── junction: course_enrollment ──────────────────────────────────────────
    # Many-to-many: student ↔ course (replaces courses.students count)
    """
    CREATE TABLE IF NOT EXISTS course_enrollment (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id   TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        course_code  TEXT NOT NULL REFERENCES courses(code) ON DELETE CASCADE,
        sem          INTEGER,
        academic_yr  INTEGER,                  -- e.g. 2025
        grade        TEXT,                     -- final grade if available
        UNIQUE(student_id, course_code, academic_yr)
    )
    """,

    # ── attendance_exclusions ────────────────────────────────────────────────
    # Stores students intentionally removed from a specific attendance sheet.
    """
    CREATE TABLE IF NOT EXISTS attendance_exclusions (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        dept        TEXT NOT NULL,
        subject     TEXT NOT NULL DEFAULT '',
        month       TEXT NOT NULL,
        year        INTEGER,
        student_id  TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE(dept, subject, month, student_id)
    )
    """,
]

# ─────────────────────────────────────────────────────────────────────────────
# ❹  SEED DATA  —  departments (not in CSV, seeded from frontend constants)
# ─────────────────────────────────────────────────────────────────────────────

DEPARTMENTS_SEED = [
    # id,    name,                                       hod,                     category,         faculty, students, estd,  pg
    ("CSE",  "Computer Science & Engineering",           "Dr. Ramesh Kumar",      "Academic",        18,     480,     1995, "M.Tech CSE, Ph.D."),
    ("ECE",  "Electronics & Comm. Engineering",          "Dr. Sunita Rao",        "Academic",        15,     360,     1997, "M.Tech VLSI"),
    ("ME",   "Mechanical Engineering",                   "Dr. Vijay Patil",       "Academic",        20,     420,     1992, "M.Tech Thermal"),
    ("EEE",  "Electrical & Electronics Engg.",           "Dr. Pradeep Gupta",     "Academic",        14,     300,     1998, "M.Tech Power"),
    ("IT",   "Information Technology",                   "Dr. Meena Iyer",        "Academic",        12,     240,     2001, "MCA"),
    ("CE",   "Civil Engineering",                        "Dr. Anil Mishra",       "Academic",        16,     350,     1992, "M.Tech Structural"),
    ("AI",   "Artificial Intelligence & ML",             "Dr. Priya Venkatesh",   "Academic",        10,     180,     2021, "M.Tech AI"),
    ("HUM",  "Humanities",                               None,                     "Academic",         0,       0,     1992, None),
    ("ADM",  "Administration",                           None,                     "Administrative",   0,       0,     1992, None),
    ("LIB",  "Library",                                  None,                     "Administrative",   0,       0,     1992, None),
]

# ─────────────────────────────────────────────────────────────────────────────
# ❺  DATA-CLEANING HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def normalise_month(raw: str, year_col: str) -> str:
    """
    Convert attendance.month to standard "Jan 2025" (MMM YYYY).
    CSV has just "Jan"; backend seed has "Jan 2025".
    Falls back to building from year_col if year is missing.
    """
    if not raw:
        return raw
    raw = raw.strip()
    # Already correct format  e.g. "Jan 2025"
    if re.match(r"^[A-Za-z]{3}\s+\d{4}$", raw):
        return raw
    # Just month name  e.g. "Jan" — append year from year_col
    if re.match(r"^[A-Za-z]{3}$", raw):
        yr = year_col.strip() if year_col and year_col.strip().isdigit() else str(datetime.now().year)
        return f"{raw} {yr}"
    # Full month name  e.g. "January 2025"
    try:
        dt = datetime.strptime(raw, "%B %Y")
        return dt.strftime("%b %Y")
    except ValueError:
        pass
    return raw  # return as-is if we can't parse


def normalise_att_id(raw: str, seq: int) -> str:
    """
    Standardise attendance IDs to AT0001 format.
    Accepts: A001, AT001, AT0001, or generates a new one from seq.
    """
    raw = raw.strip() if raw else ""
    # Strip any existing prefix and re-pad
    digits = re.sub(r"^[A-Za-z]+", "", raw)
    if digits.isdigit():
        return f"AT{int(digits):04d}"
    return f"AT{seq:04d}"


def hall_tickets_to_bool(val: str) -> int:
    """Convert "true"/"True"/"false"/"False"/0/1 to SQLite INTEGER 0/1."""
    if isinstance(val, bool):
        return int(val)
    if isinstance(val, int):
        return int(bool(val))
    return 1 if str(val).strip().lower() == "true" else 0


def impact_to_float(val: str):
    """Convert impact factor to float or None.  "—" / "" / "N/A"  →  None."""
    val = str(val).strip()
    if val in ("—", "-", "", "N/A", "NA", "None"):
        return None
    try:
        return float(val)
    except ValueError:
        return None


def clamp_cgpa(val) -> float:
    """Force CGPA into 0.0–10.0 range. Fixes test rows with cgpa=39."""
    try:
        v = float(val)
    except (TypeError, ValueError):
        return 0.0
    return max(0.0, min(10.0, v))


def safe_float(val, default=0.0) -> float:
    """Parse float with a fallback default for empty/null strings."""
    try:
        return float(val) if val not in (None, "", "null") else default
    except (TypeError, ValueError):
        return default


def safe_int(val, default=0) -> int:
    try:
        return int(val) if val not in (None, "", "null") else default
    except (TypeError, ValueError):
        return default


def read_csv(filename: str) -> list[dict]:
    """Read a CSV from CSV_DIR and return list of dicts."""
    path = CSV_DIR / filename
    if not path.exists():
        print(f"  ⚠  {filename} not found in {CSV_DIR} — skipping.")
        return []
    with open(path, newline="", encoding="utf-8-sig") as f:  # utf-8-sig handles BOM
        return list(csv.DictReader(f))


# ─────────────────────────────────────────────────────────────────────────────
# ❻  TABLE CREATION
# ─────────────────────────────────────────────────────────────────────────────

def create_tables(conn):
    """Run all DDL statements."""
    cur = conn.cursor()
    for stmt in DDL_STATEMENTS:
        cur.execute(stmt.strip())
    conn.commit()
    print("✅  All tables created (or already exist).")


# ─────────────────────────────────────────────────────────────────────────────
# ❼  SEED / INSERT FUNCTIONS  (one per table)
# ─────────────────────────────────────────────────────────────────────────────

def seed_departments(conn):
    cur = conn.cursor()
    inserted = 0
    for row in DEPARTMENTS_SEED:
        try:
            cur.execute(f"""
                INSERT INTO departments (id, name, hod, category, faculty, students, estd, pg)
                VALUES ({placeholder(8)})
            """, row)
            inserted += 1
        except Exception:
            pass  # already exists — skip
    conn.commit()
    print(f"  departments   → {inserted} rows inserted (seed data).")


def seed_students(conn):
    rows = read_csv("students.csv")
    cur  = conn.cursor()
    inserted = skipped = 0
    for r in rows:
        try:
            cur.execute(f"""
                INSERT INTO students
                    (id, name, dept, year, batch, gender, dob, phone, email,
                     status, cgpa, fee_status, paid, balance, due_date,
                     transport, guardian, address)
                VALUES ({placeholder(18)})
            """, (
                r["id"].strip(),
                r["name"].strip(),
                r["dept"].strip(),
                safe_int(r["year"]),
                safe_int(r.get("batch"), 2024),
                r.get("gender", "").strip() or None,
                r.get("dob", "").strip() or None,
                r.get("phone", "").strip() or None,
                r.get("email", "").strip() or None,
                r.get("status", "Active").strip(),
                clamp_cgpa(r.get("cgpa", 0)),
                r.get("fee_status", "Pending").strip(),
                safe_float(r.get("fees_paid")),
                safe_float(r.get("fees_due")),
                r.get("due_date", "").strip() or "2025-07-31",
                r.get("transport", "Own").strip() or "Own",
                r.get("guardian", "").strip() or None,
                r.get("address", "").strip() or None,
            ))
            inserted += 1
        except Exception as e:
            skipped += 1
            print(f"    ⚠  students row {r.get('id')} skipped: {e}")
    conn.commit()
    print(f"  students      → {inserted} inserted, {skipped} skipped.")


def seed_staff(conn):
    rows = read_csv("staff.csv")
    cur  = conn.cursor()
    inserted = skipped = 0
    for r in rows:
        try:
            cur.execute(f"""
                INSERT INTO staff
                    (id, name, dept, role, type, qual, exp,
                     publications, status, email, phone)
                VALUES ({placeholder(11)})
            """, (
                r["id"].strip(),
                r["name"].strip(),
                r["dept"].strip() or None,
                r["role"].strip(),
                r["type"].strip(),
                r.get("qual", "").strip() or None,
                safe_int(r.get("exp")),
                safe_int(r.get("publications")),
                r.get("status", "Active").strip(),
                r.get("email", "").strip() or None,
                r.get("phone", "").strip() or None,
            ))
            inserted += 1
        except Exception as e:
            skipped += 1
            print(f"    ⚠  staff row {r.get('id')} skipped: {e}")
    conn.commit()
    print(f"  staff         → {inserted} inserted, {skipped} skipped.")


def seed_courses(conn):
    """
    Inserts courses and resolves faculty_id by matching courses.faculty
    (a plain name string) against staff.name in the DB.
    """
    rows = read_csv("courses.csv")
    cur  = conn.cursor()

    # Build name → staff.id lookup from what is already in DB
    cur.execute("SELECT id, name FROM staff")
    name_to_id = {name.strip(): sid for sid, name in cur.fetchall()}

    inserted = skipped = 0
    for r in rows:
        faculty_name = r.get("faculty", "").strip()
        faculty_id   = name_to_id.get(faculty_name)  # None if not found — that's OK
        try:
            cur.execute(f"""
                INSERT INTO courses
                    (code, name, dept, credits, type, faculty, faculty_id,
                     sem, students, syllabus)
                VALUES ({placeholder(10)})
            """, (
                r["code"].strip(),
                r["name"].strip(),
                r["dept"].strip(),
                safe_int(r.get("credits"), 3),
                r.get("type", "Core").strip(),
                faculty_name or None,
                faculty_id,
                safe_int(r.get("sem"), 1),
                safe_int(r.get("students")),
                r.get("syllabus", "").strip() or None,
            ))
            inserted += 1
        except Exception as e:
            skipped += 1
            print(f"    ⚠  courses row {r.get('code')} skipped: {e}")
    conn.commit()
    print(f"  courses       → {inserted} inserted, {skipped} skipped.")


def seed_attendance(conn):
    """
    Inserts attendance rows with:
      - ID standardised to AT0001 format
      - month standardised to "Jan 2025"
    """
    rows = read_csv("attendance.csv")
    cur  = conn.cursor()
    inserted = skipped = 0
    for seq, r in enumerate(rows, start=1):
        try:
            norm_id    = normalise_att_id(r.get("id", ""), seq)
            norm_month = normalise_month(r.get("month", ""), r.get("year", ""))
            cur.execute(f"""
                INSERT INTO attendance
                    (id, student_id, student_name, dept, date, status,
                     month, year, subject, course_code)
                VALUES ({placeholder(10)})
            """, (
                norm_id,
                r["student_id"].strip(),
                r.get("student_name", "").strip() or None,
                r["dept"].strip(),
                r["date"].strip(),
                r["status"].strip(),
                norm_month or None,
                safe_int(r.get("year")) or None,
                r.get("subject", "").strip() or None,    # blank in CSV → NULL
                r.get("course_code", "").strip() or None, # blank in CSV → NULL
            ))
            inserted += 1
        except Exception as e:
            skipped += 1
            print(f"    ⚠  attendance row {r.get('id')} skipped: {e}")
    conn.commit()
    print(f"  attendance    → {inserted} inserted, {skipped} skipped.")


def seed_exams(conn):
    rows = read_csv("exams.csv")
    cur  = conn.cursor()
    inserted = skipped = 0
    for r in rows:
        try:
            cur.execute(f"""
                INSERT INTO exams
                    (id, name, dept, type, date, status, total, hall_tickets)
                VALUES ({placeholder(8)})
            """, (
                r["id"].strip(),
                r["name"].strip(),
                r.get("dept", "All").strip(),
                r["type"].strip(),
                r["date"].strip(),
                r.get("status", "Scheduled").strip(),
                safe_int(r.get("total")),
                hall_tickets_to_bool(r.get("hall_tickets", "false")),
            ))
            inserted += 1
        except Exception as e:
            skipped += 1
            print(f"    ⚠  exams row {r.get('id')} skipped: {e}")
    conn.commit()
    print(f"  exams         → {inserted} inserted, {skipped} skipped.")


def seed_fees(conn):
    rows = read_csv("fees.csv")
    cur  = conn.cursor()
    inserted = skipped = 0
    for r in rows:
        try:
            cur.execute(f"""
                INSERT INTO fees
                    (id, type, amount, freq, due_date, collected, pending)
                VALUES ({placeholder(7)})
            """, (
                r["id"].strip(),
                r["type"].strip(),
                safe_float(r.get("amount")),
                r.get("freq", "Annual").strip(),
                r.get("due_date", "").strip() or None,
                safe_float(r.get("collected")),
                safe_float(r.get("pending")),
            ))
            inserted += 1
        except Exception as e:
            skipped += 1
            print(f"    ⚠  fees row {r.get('id')} skipped: {e}")
    conn.commit()
    print(f"  fees          → {inserted} inserted, {skipped} skipped.")


def seed_certificates(conn):
    """
    Inserts certificates and resolves student_id by matching
    certificates.student (plain name) against students.name in DB.
    """
    rows = read_csv("certificates.csv")
    cur  = conn.cursor()

    # Build name → student.id lookup
    cur.execute("SELECT id, name FROM students")
    name_to_sid = {name.strip(): sid for sid, name in cur.fetchall()}

    inserted = skipped = 0
    for r in rows:
        student_name = r.get("student", "").strip()
        student_id   = name_to_sid.get(student_name)
        # Normalise "—" verification to NULL
        verif = r.get("verif", "").strip()
        verif = None if verif in ("—", "-", "") else verif
        try:
            cur.execute(f"""
                INSERT INTO certificates
                    (id, type, student, student_id, date, status, verif)
                VALUES ({placeholder(7)})
            """, (
                r["id"].strip(),
                r["type"].strip(),
                student_name or None,
                student_id,
                r["date"].strip(),
                r.get("status", "Pending").strip(),
                verif,
            ))
            inserted += 1
        except Exception as e:
            skipped += 1
            print(f"    ⚠  certificates row {r.get('id')} skipped: {e}")
    conn.commit()
    print(f"  certificates  → {inserted} inserted, {skipped} skipped.")


def seed_publications(conn):
    """
    Inserts publications and resolves staff_id by matching
    publications.author (plain name) against staff.name in DB.
    Converts impact "—" to NULL.
    """
    rows = read_csv("publications.csv")
    cur  = conn.cursor()

    # Build name → staff.id lookup
    cur.execute("SELECT id, name FROM staff")
    name_to_tid = {name.strip(): sid for sid, name in cur.fetchall()}

    inserted = skipped = 0
    for r in rows:
        author_name = r.get("author", "").strip()
        staff_id    = name_to_tid.get(author_name)
        try:
            cur.execute(f"""
                INSERT INTO publications
                    (id, title, author, staff_id, journal, year, type, impact)
                VALUES ({placeholder(8)})
            """, (
                r["id"].strip(),
                r["title"].strip(),
                author_name or None,
                staff_id,
                r.get("journal", "").strip() or None,
                safe_int(r.get("year"), 2024),
                r.get("type", "Journal").strip(),
                impact_to_float(r.get("impact", "")),
            ))
            inserted += 1
        except Exception as e:
            skipped += 1
            print(f"    ⚠  publications row {r.get('id')} skipped: {e}")
    conn.commit()
    print(f"  publications  → {inserted} inserted, {skipped} skipped.")


# ─────────────────────────────────────────────────────────────────────────────
# ❽  VERIFICATION — quick row counts
# ─────────────────────────────────────────────────────────────────────────────

TABLES = [
    "departments", "students", "staff", "courses",
    "attendance", "exams", "fees", "certificates",
    "publications", "student_fees", "course_enrollment",
]

def verify(conn):
    cur = conn.cursor()
    print("\n─── Verification ─────────────────────────────────────")
    print(f"  {'Table':<25} {'Rows':>6}")
    print(f"  {'─'*25} {'─'*6}")
    for tbl in TABLES:
        try:
            cur.execute(f"SELECT COUNT(*) FROM {tbl}")
            count = cur.fetchone()[0]
            print(f"  {tbl:<25} {count:>6}")
        except Exception as e:
            print(f"  {tbl:<25}  ERROR: {e}")

    # Spot-check: FK resolution success for certificates
    cur.execute("""
        SELECT COUNT(*) FROM certificates
        WHERE student_id IS NOT NULL
    """)
    cert_linked = cur.fetchone()[0]
    print(f"\n  certificates with student_id resolved: {cert_linked}")

    # Spot-check: FK resolution for courses
    cur.execute("SELECT COUNT(*) FROM courses WHERE faculty_id IS NOT NULL")
    course_linked = cur.fetchone()[0]
    print(f"  courses with faculty_id resolved:       {course_linked}")

    # Spot-check: publications impact NULL conversion
    cur.execute("SELECT COUNT(*) FROM publications WHERE impact IS NULL")
    null_impact = cur.fetchone()[0]
    print(f"  publications with NULL impact (was '—'): {null_impact}")

    # Spot-check: CGPA clamped correctly
    cur.execute("SELECT id, name, cgpa FROM students WHERE cgpa > 10")
    bad_cgpa = cur.fetchall()
    if bad_cgpa:
        print(f"\n  ⚠  students with cgpa > 10 (should be 0): {bad_cgpa}")
    else:
        print(f"  ✅ All student CGPA values within 0–10.")

    print("──────────────────────────────────────────────────────\n")


# ─────────────────────────────────────────────────────────────────────────────
# ❾  OPTIONAL HELPERS — useful for your FastAPI backend
# ─────────────────────────────────────────────────────────────────────────────

# Copy-paste these query helpers directly into your main.py / crud.py.

QUERY_HELPERS = '''
# ── Paste these into your FastAPI crud.py / main.py ─────────────────────────

# Get student with department name joined
GET_STUDENT_FULL = """
    SELECT s.*, d.name AS dept_name
    FROM   students s
    JOIN   departments d ON s.dept = d.id
    WHERE  s.id = ?
"""

# Get all attendance for a student with course info
GET_STUDENT_ATTENDANCE = """
    SELECT a.*, c.name AS course_name
    FROM   attendance a
    LEFT JOIN courses c ON a.course_code = c.code
    WHERE  a.student_id = ?
    ORDER  BY a.date DESC
"""

# Department-wise attendance percentage for a given month
ATT_SUMMARY_BY_DEPT = """
    SELECT   a.dept,
             COUNT(*) AS total_records,
             SUM(CASE WHEN a.status = 'P' THEN 1 ELSE 0 END) AS present,
             ROUND(
                 100.0 * SUM(CASE WHEN a.status = 'P' THEN 1 ELSE 0 END)
                 / NULLIF(SUM(CASE WHEN a.status != 'H' THEN 1 ELSE 0 END), 0),
                 1
             ) AS attendance_pct
    FROM     attendance a
    WHERE    a.month = ?
    GROUP BY a.dept
"""

# Students with attendance below 75% for a given month
LOW_ATTENDANCE = """
    SELECT   s.id, s.name, s.dept, s.email,
             ROUND(
                 100.0 * SUM(CASE WHEN a.status = 'P' THEN 1 ELSE 0 END)
                 / NULLIF(SUM(CASE WHEN a.status != 'H' THEN 1 ELSE 0 END), 0),
                 1
             ) AS att_pct
    FROM     attendance a
    JOIN     students s ON a.student_id = s.id
    WHERE    a.month = ?
    GROUP BY s.id
    HAVING   att_pct < 75
    ORDER BY att_pct ASC
"""

# Fee collection summary
FEE_SUMMARY = """
    SELECT   type,
             amount,
             collected,
             pending,
             ROUND(100.0 * collected / NULLIF(amount, 0), 1) AS recovery_pct
    FROM     fees
    ORDER BY type
"""

# All certificates for a student (via student_id FK)
STUDENT_CERTS = """
    SELECT c.*
    FROM   certificates c
    WHERE  c.student_id = ?
    ORDER  BY c.date DESC
"""

# Publications by a staff member (via staff_id FK)
STAFF_PUBS = """
    SELECT p.*
    FROM   publications p
    WHERE  p.staff_id = ?
    ORDER  BY p.year DESC
"""

# Courses taught by a staff member (via faculty_id FK)
STAFF_COURSES = """
    SELECT c.*
    FROM   courses c
    WHERE  c.faculty_id = ?
"""

# Dashboard summary counts
DASHBOARD_SUMMARY = """
    SELECT
        (SELECT COUNT(*) FROM students WHERE status = 'Active')   AS active_students,
        (SELECT COUNT(*) FROM students WHERE status = 'Alumni')   AS alumni,
        (SELECT COUNT(*) FROM staff    WHERE type = 'Teaching')   AS teaching_staff,
        (SELECT COUNT(*) FROM staff    WHERE type = 'Support')    AS support_staff,
        (SELECT COUNT(*) FROM courses)                            AS total_courses,
        (SELECT COUNT(*) FROM exams    WHERE status IN ('Upcoming','Scheduled')) AS upcoming_exams,
        (SELECT ROUND(SUM(collected)*100.0/NULLIF(SUM(amount),0),1) FROM fees)  AS fee_recovery_pct
"""
'''


def print_query_helpers():
    print("\n─── FastAPI Query Helpers ─────────────────────────────")
    print(QUERY_HELPERS)
    print("──────────────────────────────────────────────────────\n")


# ─────────────────────────────────────────────────────────────────────────────
# ❿  MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print(f"\n{'='*54}")
    print(f"  Vidyasagar University ERP — DB Setup")
    print(f"  DB type : {DB_TYPE.upper()}")
    if DB_TYPE == "sqlite":
        print(f"  DB file : {SQLITE_PATH}")
    print(f"  CSV dir : {CSV_DIR}")
    print(f"{'='*54}\n")

    conn = get_connection()

    # 1. Create tables
    print("── Creating tables …")
    create_tables(conn)

    # 2. Seed in dependency order
    #    (departments first because others FK to it)
    print("\n── Inserting data …")
    seed_departments(conn)
    seed_students(conn)      # depends on: departments
    seed_staff(conn)         # depends on: departments
    seed_courses(conn)       # depends on: departments, staff (faculty_id lookup)
    seed_attendance(conn)    # depends on: students, departments
    seed_exams(conn)         # standalone
    seed_fees(conn)          # standalone
    seed_certificates(conn)  # depends on: students (student_id lookup)
    seed_publications(conn)  # depends on: staff (staff_id lookup)

    # 3. Verify
    verify(conn)

    # 4. Print query helpers for backend use
    print_query_helpers()

    conn.close()
    print("✅  Done. Database is ready.\n")


if __name__ == "__main__":
    main()
