"""
Rebuild the SQLite database from the seeded CSV data for a clean client demo.

Usage:
    python3 prepare_demo_db.py

Environment:
    SQLITE_PATH   Optional override for the SQLite file location.
"""

from __future__ import annotations

import shutil
from datetime import datetime
from pathlib import Path

import erp_db_setup
import main


DB_PATH = Path(main.SQLITE_PATH)
BACKUP_DIR = DB_PATH.parent / "backups"


def backup_existing_db() -> Path | None:
    if not DB_PATH.exists():
        return None
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = BACKUP_DIR / f"{DB_PATH.stem}_{stamp}{DB_PATH.suffix}"
    shutil.copy2(DB_PATH, backup_path)
    DB_PATH.unlink()
    return backup_path


def seed_clean_demo_db() -> dict:
    conn = erp_db_setup.get_connection()
    try:
        erp_db_setup.create_tables(conn)
        cur = conn.cursor()
        for ddl in main.EXTRA_DDL:
            cur.execute(ddl)
        erp_db_setup.seed_departments(conn)
        erp_db_setup.seed_students(conn)
        erp_db_setup.seed_staff(conn)
        erp_db_setup.seed_courses(conn)
        erp_db_setup.seed_attendance(conn)
        erp_db_setup.seed_exams(conn)
        erp_db_setup.seed_fees(conn)
        erp_db_setup.seed_certificates(conn)
        erp_db_setup.seed_publications(conn)
        conn.commit()
    finally:
        conn.close()

    with main.get_db() as conn2:
        cur = conn2.cursor()
        main.ensure_department_category_column(cur)
        main._seed_extra_if_empty(cur)
        main.ensure_fee_catalog(cur)
        main.ensure_all_student_fee_rows(cur)
        main.backfill_course_enrollments(cur)
        main.sync_fee_master_balances(cur)
        counts = {}
        for table in [
            "departments", "students", "staff", "courses", "attendance",
            "exams", "fees", "alumni", "alerts", "student_fees",
            "course_enrollment",
        ]:
            cur.execute(f"SELECT COUNT(*) FROM {table}")
            counts[table] = cur.fetchone()[0]
    return counts


def main_cli():
    backup = backup_existing_db()
    counts = seed_clean_demo_db()
    print(f"Demo database ready: {DB_PATH}")
    if backup:
        print(f"Backup saved: {backup}")
    for table, count in counts.items():
        print(f"{table:18} {count}")


if __name__ == "__main__":
    main_cli()
