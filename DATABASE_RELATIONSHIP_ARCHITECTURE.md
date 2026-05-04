# College ERP Database Relationship Architecture

Generated on: 2026-05-04

## Verification Result

The current SQLite database was checked with:

```sql
PRAGMA foreign_key_check;
```

Result:

```text
No broken foreign key records found.
```

So the currently enforced database relations are valid.

Important note: some modules are intentionally connected by application logic only, not by strict database foreign keys. This is acceptable for demo/pilot use, but before production deployment those soft links should be hardened.

## High-Level Architecture

```mermaid
flowchart TB
  departments["departments"]
  students["students"]
  staff["staff"]
  courses["courses"]
  attendance["attendance"]
  fees["fees"]
  student_fees["student_fees"]
  course_enrollment["course_enrollment"]
  certificates["certificates"]
  publications["publications"]
  attendance_exclusions["attendance_exclusions"]
  exams["exams"]
  alumni["alumni"]
  batches["batches"]
  transport["transport"]
  alerts["alerts"]
  aicte_checklist["aicte_checklist"]
  aicte_inspections["aicte_inspections"]
  aicte_institution["aicte_institution"]

  departments --> students
  departments --> staff
  departments --> courses
  departments --> attendance

  staff --> courses
  staff --> publications

  students --> attendance
  students --> certificates
  students --> student_fees
  students --> course_enrollment
  students --> attendance_exclusions

  fees --> student_fees
  courses --> course_enrollment
  courses --> attendance

  departments -. "soft link by dept text" .-> exams
  departments -. "soft link by dept text" .-> alumni
  departments -. "soft link by dept text" .-> batches
  students -. "soft transport choice" .-> transport

  aicte_checklist -. "standalone compliance data" .-> aicte_institution
  aicte_inspections -. "standalone compliance data" .-> aicte_institution
  alerts -. "dashboard standalone" .-> departments
```

## Entity Relationship Diagram

```mermaid
erDiagram
  departments {
    TEXT id PK
    TEXT name
    TEXT hod
    TEXT category
    INTEGER faculty
    INTEGER students
    INTEGER estd
    TEXT pg
  }

  students {
    TEXT id PK
    TEXT name
    TEXT dept FK
    INTEGER year
    INTEGER batch
    TEXT gender
    TEXT email
    TEXT status
    REAL cgpa
    TEXT fee_status
    REAL tuition
    REAL hostel
    REAL transport_fee
    REAL lab
    REAL exam
    REAL library
    REAL paid
    REAL balance
    TEXT due_date
  }

  staff {
    TEXT id PK
    TEXT name
    TEXT dept FK
    TEXT role
    TEXT type
    TEXT qual
    INTEGER exp
    INTEGER publications
    TEXT status
    TEXT email
  }

  courses {
    TEXT code PK
    TEXT name
    TEXT dept FK
    INTEGER credits
    TEXT type
    TEXT faculty
    TEXT faculty_id FK
    INTEGER sem
    INTEGER students
  }

  attendance {
    TEXT id PK
    TEXT student_id FK
    TEXT student_name
    TEXT dept FK
    TEXT date
    TEXT status
    TEXT month
    INTEGER year
    TEXT subject
    TEXT course_code FK
  }

  fees {
    TEXT id PK
    TEXT type
    REAL amount
    TEXT freq
    TEXT due_date
    REAL collected
    REAL pending
  }

  student_fees {
    INTEGER id PK
    TEXT student_id FK
    TEXT fee_id FK
    REAL amount_paid
    TEXT paid_date
    TEXT receipt_no
  }

  course_enrollment {
    INTEGER id PK
    TEXT student_id FK
    TEXT course_code FK
    INTEGER sem
    INTEGER academic_yr
    TEXT grade
  }

  certificates {
    TEXT id PK
    TEXT type
    TEXT student
    TEXT student_id FK
    TEXT date
    TEXT status
    TEXT verif
  }

  publications {
    TEXT id PK
    TEXT title
    TEXT author
    TEXT staff_id FK
    TEXT journal
    INTEGER year
    TEXT type
    REAL impact
  }

  attendance_exclusions {
    INTEGER id PK
    TEXT dept
    TEXT subject
    TEXT month
    INTEGER year
    TEXT student_id FK
  }

  departments ||--o{ students : "students.dept"
  departments ||--o{ staff : "staff.dept"
  departments ||--o{ courses : "courses.dept"
  departments ||--o{ attendance : "attendance.dept"

  staff ||--o{ courses : "courses.faculty_id"
  staff ||--o{ publications : "publications.staff_id"

  students ||--o{ attendance : "attendance.student_id"
  students ||--o{ certificates : "certificates.student_id"
  students ||--o{ student_fees : "student_fees.student_id"
  students ||--o{ course_enrollment : "course_enrollment.student_id"
  students ||--o{ attendance_exclusions : "attendance_exclusions.student_id"

  fees ||--o{ student_fees : "student_fees.fee_id"
  courses ||--o{ course_enrollment : "course_enrollment.course_code"
  courses ||--o{ attendance : "attendance.course_code"
```

## Actual Enforced Foreign Keys

| Child Table | Child Column | Parent Table | Parent Column | Delete Rule | Meaning |
|---|---|---|---|---|---|
| `students` | `dept` | `departments` | `id` | `RESTRICT` | A student must belong to a valid department |
| `staff` | `dept` | `departments` | `id` | `SET NULL` | Staff can belong to a department |
| `courses` | `dept` | `departments` | `id` | `RESTRICT` | A course must belong to a valid department |
| `courses` | `faculty_id` | `staff` | `id` | `SET NULL` | A course can be assigned to a staff member |
| `attendance` | `student_id` | `students` | `id` | `CASCADE` | Attendance belongs to a student |
| `attendance` | `dept` | `departments` | `id` | `RESTRICT` | Attendance is linked to a department |
| `attendance` | `course_code` | `courses` | `code` | `SET NULL` | Attendance can be linked to a course |
| `certificates` | `student_id` | `students` | `id` | `RESTRICT` | Certificates belong to students |
| `publications` | `staff_id` | `staff` | `id` | `SET NULL` | Publications can be linked to staff |
| `student_fees` | `student_id` | `students` | `id` | `CASCADE` | Fee collection ledger belongs to student |
| `student_fees` | `fee_id` | `fees` | `id` | `RESTRICT` | Fee collection row belongs to fee head |
| `course_enrollment` | `student_id` | `students` | `id` | `CASCADE` | Enrollment belongs to student |
| `course_enrollment` | `course_code` | `courses` | `code` | `CASCADE` | Enrollment belongs to course |
| `attendance_exclusions` | `student_id` | `students` | `id` | `CASCADE` | Attendance sheet exclusion belongs to student |

## Section-by-Section Relationship Status

| Section | Relationship Status | Notes |
|---|---|---|
| Dashboard | Good | Reads live counts from multiple tables |
| Students | Good | Hard FK to departments; connected to attendance, fees, certificates, enrollments |
| Staff | Good | Hard FK to departments; connected to courses and publications |
| Departments | Good | Parent table for students, staff, courses, attendance |
| Courses | Good | Hard FK to departments and staff; linked to attendance and enrollments |
| Attendance | Good | Hard FK to students/departments/courses; report generation is database-backed |
| Fees | Good for demo/pilot | `student_fees` stores collection ledger; fee demand is currently stored in student fee component columns |
| Examinations | Soft link | `exams.dept` is text because it can be `"All"`; production can use a junction table |
| Alumni | Soft link | `alumni.dept` is text; production should add FK to departments |
| Batches | Soft link | `batches.dept` is text; production should add FK to departments or derive from students |
| Transport | Soft link | Student transport is stored as text; production should add route FK |
| Alerts | Standalone | OK as dashboard notification data |
| AICTE | Standalone/compliance | OK for compliance records, not strongly tied to core academic tables |
| Certificates | Good | Hard FK to students through `student_id` |
| Publications | Good | Hard FK to staff through `staff_id` |

## Core Academic Flow

```mermaid
flowchart LR
  D["Department"] --> S["Student"]
  D --> ST["Staff"]
  D --> C["Course"]
  ST --> C
  S --> CE["Course Enrollment"]
  C --> CE
  S --> A["Attendance"]
  C --> A
  D --> A
```

## Fee Flow

```mermaid
flowchart LR
  S["Student"] --> Demand["Fee Demand Columns on students table"]
  F["Fee Master"] --> SF["student_fees Collection Ledger"]
  S --> SF
  Demand --> Calc["Total Demand"]
  SF --> Collection["Total Collection"]
  Calc --> Outstanding["Outstanding = Demand - Collection"]
  Collection --> Outstanding
```

For the current demo/pilot:

```text
Total Demand = tuition + hostel + transport_fee + lab + exam + library + sports
             + development + admission + alumni_fee + medical + placement
             + it_infra + miscellaneous

Total Collection = sum(student_fees.amount_paid) or student paid/collection field

Outstanding = max(Total Demand - Total Collection, 0)
```

For production, a cleaner accounting model would split demand and payment into separate tables:

```text
student_fee_demands
student_fee_payments
student_fee_receipts
```

## Production Hardening Recommendations

The current schema is safe for demo and pilot use. Before production, improve these areas:

1. Add `hod_staff_id` to `departments` and reference `staff.id`.
2. Add `department_id` FK to `alumni`.
3. Add `department_id` FK to `batches`, or generate batches directly from students.
4. Replace `exams.dept = "All"` with an `exam_departments` junction table.
5. Add `transport_route_id` to students and reference `transport.id`.
6. Make attendance always store `course_code`, not only subject text.
7. Move fee demand into a dedicated `student_fee_demands` table.
8. Move fee payments into a dedicated `student_fee_payments` table with receipt numbers and payment mode.
9. Add audit tables for create/edit/delete/import/export actions.
10. Add production user/role tables instead of in-memory demo users.

## Conclusion

The enforced table relations are currently valid. The main academic, staff, course, attendance, certificate, publication, fee, and enrollment relationships are correctly connected with foreign keys.

For demo and client presentation, the database structure is acceptable.

For final production sale, the schema should be hardened by converting the remaining soft links into strict foreign keys or junction tables.

