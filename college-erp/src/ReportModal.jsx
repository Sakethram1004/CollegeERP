import { useEffect, useState } from "react";
import { reports } from "./api";

const COLORS = ["#2563eb", "#14b8a6", "#f59e0b", "#7c3aed", "#ef4444", "#0ea5e9"];
const SURFACE = "#ffffff";
const SURFACE_ALT = "#f7f8fc";
const BORDER = "#e2e5ef";
const TEXT = "#0f172a";
const TEXT_SOFT = "#64748b";

function SectionTitle({ children, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: TEXT, textTransform: "uppercase", letterSpacing: "0.8px" }}>{children}</div>
      {hint && <div style={{ fontSize: 11, color: TEXT_SOFT }}>{hint}</div>}
    </div>
  );
}

function StatBox({ label, value, color = "#2563eb" }) {
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 18px", boxShadow: "0 8px 24px rgba(15,23,42,0.06)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: color }} />
      <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: "'Syne', sans-serif", letterSpacing: "-0.8px" }}>{value}</div>
      <div style={{ fontSize: 10, color: TEXT_SOFT, textTransform: "uppercase", letterSpacing: "0.6px", marginTop: 6, fontWeight: 700 }}>{label}</div>
    </div>
  );
}

function BarChart({ data, title }) {
  if (!data || Object.keys(data).length === 0) return null;
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => Number(v) || 0), 1);

  return (
    <div style={{ marginBottom: 24, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
      <SectionTitle>{title}</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.map(([key, val], i) => {
          const pct = Math.round((Number(val) / max) * 100);
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 150, fontSize: 12, color: TEXT_SOFT, textAlign: "right", flexShrink: 0 }}>{key}</div>
              <div style={{ flex: 1, height: 24, background: SURFACE_ALT, borderRadius: 8, overflow: "hidden", border: `1px solid ${BORDER}` }}>
                <div style={{ height: "100%", width: `${pct}%`, minWidth: 34, background: COLORS[i % COLORS.length], borderRadius: 8, transition: "width 0.6s ease", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#ffffff" }}>{val}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Table({ rows, columns, title, hint }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div style={{ marginBottom: 24, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
      {title && <SectionTitle hint={hint}>{title}</SectionTitle>}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={{ textAlign: "left", padding: "10px 12px", background: SURFACE_ALT, color: TEXT_SOFT, fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap" }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 20).map((row, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                {columns.map((c) => (
                  <td key={c.key} style={{ padding: "10px 12px", color: c.highlight ? TEXT : TEXT_SOFT, fontWeight: c.highlight ? 700 : 500 }}>{row[c.key] ?? "—"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > 20 && <div style={{ padding: "10px 2px 0", fontSize: 11, color: TEXT_SOFT }}>... and {rows.length - 20} more rows</div>}
      </div>
    </div>
  );
}

function Checklist({ items, title }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom: 24, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
      <SectionTitle hint={`${items.length} checkpoints`}>{title}</SectionTitle>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "12px 14px", borderBottom: i === items.length - 1 ? "none" : `1px solid ${BORDER}`, fontSize: 12, background: i % 2 ? SURFACE_ALT : "transparent", borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span>{item.status === "ok" ? "✅" : "⚠️"}</span>
            <span style={{ color: TEXT, fontWeight: 700 }}>{item.item}</span>
          </div>
          <span style={{ color: item.status === "ok" ? "#059669" : "#ea580c", fontWeight: 700, fontSize: 11 }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function StudentReport({ data }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        <StatBox label="Total Students" value={data.summary.total_students} color="#2563eb" />
        <StatBox label="Active" value={data.summary.active} color="#14b8a6" />
        <StatBox label="Inactive / Alumni" value={data.summary.inactive} color="#ef4444" />
        <StatBox label="Average CGPA" value={data.summary.average_cgpa} color="#7c3aed" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <BarChart data={data.dept_distribution} title="Department-wise Distribution" />
        <BarChart data={data.gender_distribution} title="Gender Distribution" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <BarChart data={data.cgpa_bands} title="CGPA Performance Bands" />
        <BarChart data={data.fee_status_distribution} title="Fee Status Distribution" />
      </div>
    </>
  );
}

function FinancialReport({ data }) {
  return (
    <>
      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 24 }}>
        <StatBox label="Total Students" value={data.summary.total_students ?? "—"} color="#7c3aed" />
        <StatBox label="Total Receivable" value={`₹${(data.summary.total_receivable / 100000).toFixed(1)}L`} color="#2563eb" />
        <StatBox label="Collected" value={`₹${(data.summary.total_collected / 100000).toFixed(1)}L`} color="#14b8a6" />
        <StatBox label="Pending" value={`₹${(data.summary.total_pending / 1000).toFixed(0)}K`} color="#ef4444" />
        <StatBox label="Recovery %" value={`${data.summary.recovery_percentage}%`} color="#f59e0b" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <BarChart data={data.student_fee_status} title="Student Fee Status" />
        <BarChart data={data.dept_collection} title="Dept-wise Collection (₹)" />
      </div>
      <BarChart data={Object.fromEntries((data.fee_breakdown || []).map((f) => [f.type, f.collected]))} title="Collection by Fee Component" />

      {/* Fee component breakdown table */}
      <Table
        title="Fee Component Breakdown"
        rows={data.fee_breakdown || []}
        columns={[
          { key: "type", label: "Fee Component", highlight: true },
          { key: "amount", label: "Total (₹)" },
          { key: "collected", label: "Collected (₹)" },
          { key: "pending", label: "Pending (₹)" },
          { key: "recovery_pct", label: "Recovery %" },
        ]}
      />

      {/* Student-wise fee table */}
      <Table
        title="Student-wise Fee Report"
        rows={data.student_table || []}
        columns={[
          { key: "id", label: "ID" },
          { key: "name", label: "Name", highlight: true },
          { key: "dept", label: "Dept" },
          { key: "year", label: "Year" },
          { key: "total", label: "Total (₹)" },
          { key: "paid", label: "Paid (₹)" },
          { key: "due", label: "Balance (₹)" },
          { key: "fee_status", label: "Status" },
          { key: "due_date", label: "Due Date" },
        ]}
      />
    </>
  );
}

function ExamReport({ data }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        <StatBox label="Total Exams" value={data.summary.total_exams} color="#2563eb" />
        <StatBox label="Completed" value={data.summary.completed} color="#14b8a6" />
        <StatBox label="Upcoming" value={data.summary.upcoming} color="#f59e0b" />
        <StatBox label="Hall Tickets" value={data.summary.hall_tickets_issued} color="#7c3aed" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <BarChart data={data.exam_type_distribution} title="Exam Type Distribution" />
        <BarChart data={data.student_performance_bands} title="Student Performance Distribution" />
      </div>
      <Table
        title="All Examinations"
        rows={data.exams}
        columns={[
          { key: "id", label: "ID" },
          { key: "name", label: "Name", highlight: true },
          { key: "type", label: "Type" },
          { key: "dept", label: "Dept" },
          { key: "date", label: "Date" },
          { key: "total", label: "Students" },
          { key: "status", label: "Status" },
        ]}
      />
    </>
  );
}

function AttendanceReport({ data }) {
  return (
    <>
      {data.summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
          <StatBox label="Records" value={data.summary.total_records} color="#2563eb" />
          <StatBox label="Students Tracked" value={data.summary.students_tracked} color="#14b8a6" />
          <StatBox label="Shortage Count" value={data.summary.shortage_count} color="#ef4444" />
        </div>
      )}
      <BarChart data={Object.fromEntries((data.dept_summary || []).map((d) => [d.dept, d.avg_attendance]))} title="Department-wise Avg Attendance %" />
      {data.shortage_students?.length > 0 && (
        <Table
          title="Students with Attendance Shortage (<75%)"
          rows={data.shortage_students}
          columns={[
            { key: "student_id", label: "ID" },
            { key: "name", label: "Name", highlight: true },
            { key: "dept", label: "Dept" },
            { key: "attendance_pct", label: "Attendance %" },
          ]}
        />
      )}
      {data.note && <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#2563eb", fontWeight: 600 }}>{data.note}</div>}
    </>
  );
}

function ResearchReport({ data }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        <StatBox label="Total Publications" value={data.summary.total_publications} color="#2563eb" />
        <StatBox label="Journal Papers" value={data.summary.journal_papers} color="#14b8a6" />
        <StatBox label="Avg Impact Factor" value={data.summary.avg_impact_factor} color="#7c3aed" />
        <StatBox label="Faculty Publications" value={data.summary.total_faculty_publications ?? data.summary.total_publications} color="#f59e0b" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <BarChart data={data.type_distribution} title="Publication Type Distribution" />
        <BarChart data={data.year_wise} title="Year-wise Publication Count" />
      </div>
      <BarChart data={data.author_contributions} title="Author Contributions" />
      <Table
        title="Recent Publications"
        rows={data.publications}
        columns={[
          { key: "id", label: "ID" },
          { key: "title", label: "Title", highlight: true },
          { key: "author", label: "Author" },
          { key: "type", label: "Type" },
          { key: "year", label: "Year" },
          { key: "impact", label: "Impact" },
        ]}
      />
    </>
  );
}

function AICTEReport({ data }) {
  // compliance_score is now returned directly by the backend; fall back to client-side calc
  const complianceScore = data?.summary?.compliance_score ?? (
    Array.isArray(data?.checklist) && data.checklist.length
      ? Math.round((data.checklist.filter((item) => item.status === "ok").length / data.checklist.length) * 100)
      : 0
  );

  // institution is now [{label, value}] from the backend
  const institutionRows = Array.isArray(data?.institution) && data.institution.length > 0
    ? data.institution
    : data?.institution && typeof data.institution === "object" && !Array.isArray(data.institution)
      ? Object.entries(data.institution).map(([label, value]) => ({ label, value }))
      : [];

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        <StatBox label="Total Students" value={data.summary.total_students} color="#2563eb" />
        <StatBox label="Teaching Faculty" value={data.summary.total_faculty} color="#14b8a6" />
        <StatBox label="Total Staff" value={data.summary.total_staff ?? "—"} color="#0ea5e9" />
        <StatBox label="Ph.D. Faculty" value={`${data.summary.phd_percentage}%`} color="#7c3aed" />
        <StatBox label="F:S Ratio" value={data.summary.fs_ratio} color="#f59e0b" />
        <StatBox label="Compliance Score" value={`${complianceScore}%`}
          color={complianceScore >= 75 ? "#16a34a" : "#ef4444"} />
      </div>

      {data.dept_faculty && Object.keys(data.dept_faculty).length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <BarChart data={data.dept_faculty} title="Department-wise Staff Count" />
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18, boxShadow: "0 8px 24px rgba(15,23,42,0.06)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 11, color: TEXT_SOFT, textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 700 }}>Total Publications</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: "#0ea5e9", fontFamily: "'Syne', sans-serif" }}>{data.total_publications}</div>
          </div>
        </div>
      )}

      <Checklist items={data.checklist} title="Compliance Checklist" />

      {institutionRows.length > 0 && (
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 18px", marginTop: 8, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
          <SectionTitle>Institution Details</SectionTitle>
          {institutionRows.map((row, i) => (
            <div key={row.label || i} style={{ display: "flex", justifyContent: "space-between", gap: 18, padding: "10px 0", borderBottom: i === institutionRows.length - 1 ? "none" : `1px solid ${BORDER}`, fontSize: 12 }}>
              <span style={{ color: TEXT_SOFT, textTransform: "capitalize" }}>{String(row.label).replace(/_/g, " ")}</span>
              <span style={{ color: TEXT, fontWeight: 700, textAlign: "right" }}>{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const REPORT_CONFIG = {
  "Student Analytics": { fn: "studentAnalytics", component: StudentReport },
  "Financial Report": { fn: "financial", component: FinancialReport },
  "Exam Results": { fn: "examResults", component: ExamReport },
  "Attendance Report": { fn: "attendance", component: AttendanceReport },
  "Research Output": { fn: "research", component: ResearchReport },
  "AICTE Data Sheet": { fn: "aicte", component: AICTEReport },
};

export default function ReportModal({ reportTitle, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const config = REPORT_CONFIG[reportTitle];

  useEffect(() => {
    if (!config) return;
    setLoading(true);
    setError("");
    reports[config.fn]()
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [reportTitle, config]);

  const printReport = () => window.print();

  return (
    <>
      <style>{`
        .rep-overlay {
          position: fixed; inset: 0; z-index: 2000;
          background: rgba(15,23,42,0.35); backdrop-filter: blur(8px);
          display: flex; align-items: flex-start; justify-content: center;
          padding: 24px; overflow-y: auto;
        }
        .rep-modal {
          background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
          border: 1px solid ${BORDER};
          border-radius: 20px;
          width: 1040px;
          max-width: 100%;
          animation: slideUp 0.25s ease;
          box-shadow: 0 30px 80px rgba(15,23,42,0.18);
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: none; opacity: 1; } }
        .rep-head {
          padding: 22px 24px;
          border-bottom: 1px solid ${BORDER};
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          position: sticky; top: 0;
          background: rgba(248,250,252,0.92);
          border-radius: 20px 20px 0 0;
          z-index: 1;
          backdrop-filter: blur(10px);
        }
        .rep-head-left { flex: 1; }
        .rep-head-title {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: ${TEXT};
          letter-spacing: -0.5px;
        }
        .rep-head-time { font-size: 11px; color: ${TEXT_SOFT}; margin-top: 4px; }
        .rep-head-actions { display: flex; gap: 8px; }
        .rep-body { padding: 24px; }
        .rep-close {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          font-size: 18px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.18s;
        }
        .rep-close:hover { background: #fecaca; }
        .rep-act-btn {
          background: ${SURFACE};
          border: 1px solid ${BORDER};
          color: ${TEXT_SOFT};
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.18s;
          display: flex; align-items: center; gap: 6px;
        }
        .rep-act-btn:hover { color: ${TEXT}; border-color: #cbd5e1; background: ${SURFACE_ALT}; }
        .rep-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 90px 20px;
          gap: 16px;
        }
        .rep-spin {
          width: 36px;
          height: 36px;
          border: 3px solid #dbeafe;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          .rep-overlay { position: static; background: white; padding: 0; }
          .rep-modal { border: none; border-radius: 0; box-shadow: none; }
          .rep-head-actions, .rep-close { display: none !important; }
        }
      `}</style>

      <div className="rep-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="rep-modal">
          <div className="rep-head">
            <div className="rep-head-left">
              <div className="rep-head-title">📊 {reportTitle}</div>
              {data && <div className="rep-head-time">Generated: {new Date(data.generated_at).toLocaleString()}</div>}
            </div>
            <div className="rep-head-actions">
              <button className="rep-act-btn" onClick={printReport}>🖨️ Print</button>
              <button className="rep-close" onClick={onClose}>×</button>
            </div>
          </div>

          <div className="rep-body">
            {loading && (
              <div className="rep-loading">
                <div className="rep-spin" />
                <div style={{ fontSize: 13, color: TEXT_SOFT, fontWeight: 600 }}>Generating report...</div>
              </div>
            )}
            {!loading && error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "16px 18px", color: "#dc2626", fontSize: 13, fontWeight: 600 }}>
                Failed to generate report: {error}. Make sure the backend is running at `http://localhost:8000`.
              </div>
            )}
            {data && config && (() => {
              const Component = config.component;
              return <Component data={data} />;
            })()}
          </div>
        </div>
      </div>
    </>
  );
}