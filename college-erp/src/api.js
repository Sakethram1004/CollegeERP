// src/api.js
// Central API service — v5.0 (Fixed persistence)
// All data reads/writes go through this file to the FastAPI backend.
// Backend base:
// - production: set VITE_API_BASE_URL
// - same-origin deploys: leave unset and requests use relative /path
// - local dev fallback: http://localhost:8000
const BASE = (() => {
  const raw = (import.meta.env.VITE_API_BASE_URL || "").trim();
  if (raw) return raw.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location.hostname && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "";
  }
  return "http://localhost:8000";
})();
export const API_BASE_LABEL = BASE || "same-origin backend";
export const DEMO_MODE = String(import.meta.env.VITE_DEMO_MODE || "").trim().toLowerCase() === "true";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function readCookie(key) {
  const prefix = `${encodeURIComponent(key)}=`;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

function writeCookie(key, value) {
  document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearCookie(key) {
  document.cookie = `${encodeURIComponent(key)}=; path=/; max-age=0; SameSite=Lax`;
}

export function getStoredValue(key) {
  try {
    const local = localStorage.getItem(key);
    if (local !== null) return local;
  } catch { }
  return readCookie(key);
}

export function setStoredValue(key, value) {
  try { localStorage.setItem(key, value); } catch { }
  writeCookie(key, value);
}

export function clearStoredValue(key) {
  try { localStorage.removeItem(key); } catch { }
  clearCookie(key);
}

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken  = ()            => getStoredValue("erp_token");
export const getUser   = ()            => {
  const raw = getStoredValue("erp_user");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};
export const setAuth   = (token, user) => {
  setStoredValue("erp_token", token);
  setStoredValue("erp_user", JSON.stringify(user));
};
export const clearAuth = () => {
  clearStoredValue("erp_token");
  clearStoredValue("erp_user");
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function req(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("text/csv")) return res.blob();
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  login:  (username, password) => req("/auth/login",  { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: ()                   => req(`/auth/logout?token=${getToken()}`, { method: "POST" }),
  me:     ()                   => req(`/auth/me?token=${getToken()}`),
};

// ── Students ──────────────────────────────────────────────────────────────────
// GET /students → { total, students: [...] }
export const students = {
  list:   (params = {}) => req("/students?" + new URLSearchParams(params)),
  get:    (id)          => req(`/students/${id}`),
  create: (data)        => req("/students",      { method: "POST",   body: JSON.stringify(data) }),
  update: (id, data)    => req(`/students/${id}`, { method: "PUT",    body: JSON.stringify(data) }),
  delete: (id)          => req(`/students/${id}`, { method: "DELETE" }),
  export: ()            => req("/export/students"),
};

// ── Alumni ────────────────────────────────────────────────────────────────────
// GET /alumni → { total, alumni: [...] }
export const alumni = {
  list:   (params = {}) => req("/alumni?" + new URLSearchParams(params)),
  create: (data)        => req("/alumni",        { method: "POST",   body: JSON.stringify(data) }),
  update: (id, data)    => req(`/alumni/${id}`,   { method: "PUT",    body: JSON.stringify(data) }),
  delete: (id)          => req(`/alumni/${id}`,   { method: "DELETE" }),
};

// ── Staff ─────────────────────────────────────────────────────────────────────
// GET /staff → { total, staff: [...] }
export const staff = {
  list:   (params = {}) => req("/staff?" + new URLSearchParams(params)),
  create: (data)        => req("/staff",         { method: "POST",   body: JSON.stringify(data) }),
  update: (id, data)    => req(`/staff/${id}`,    { method: "PUT",    body: JSON.stringify(data) }),
  delete: (id)          => req(`/staff/${id}`,    { method: "DELETE" }),
};

// ── Departments ───────────────────────────────────────────────────────────────
// GET /departments → { total, departments: [...] }
export const departments = {
  list:   ()         => req("/departments"),
  create: (data)     => req("/departments",        { method: "POST",   body: JSON.stringify(data) }),
  update: (id, data) => req(`/departments/${id}`,   { method: "PUT",    body: JSON.stringify(data) }),
  delete: (id)       => req(`/departments/${id}`,   { method: "DELETE" }),
};

// ── Courses ───────────────────────────────────────────────────────────────────
// GET /courses → { total, courses: [...] }
export const courses = {
  list:   (params = {}) => req("/courses?" + new URLSearchParams(params)),
  create: (data)        => req("/courses",          { method: "POST",   body: JSON.stringify(data) }),
  update: (code, data)  => req(`/courses/${code}`,   { method: "PUT",    body: JSON.stringify(data) }),
  delete: (code)        => req(`/courses/${code}`,   { method: "DELETE" }),
};

// ── Exams ─────────────────────────────────────────────────────────────────────
// GET /exams → { total, exams: [...] }
export const exams = {
  list:   (params = {}) => req("/exams?" + new URLSearchParams(params)),
  create: (data)        => req("/exams",           { method: "POST",   body: JSON.stringify(data) }),
  update: (id, data)    => req(`/exams/${id}`,      { method: "PUT",    body: JSON.stringify(data) }),
  delete: (id)          => req(`/exams/${id}`,      { method: "DELETE" }),
};

// ── Fees ──────────────────────────────────────────────────────────────────────
// GET /fees → { total_amount, fees: [...] }
export const fees = {
  list:   ()         => req("/fees"),
  create: (data)     => req("/fees",          { method: "POST",   body: JSON.stringify(data) }),
  update: (id, data) => req(`/fees/${id}`,     { method: "PUT",    body: JSON.stringify(data) }),
  delete: (id)       => req(`/fees/${id}`,     { method: "DELETE" }),
};

// ── Transport ─────────────────────────────────────────────────────────────────
// GET /transport → { total, routes: [...] }
export const transport = {
  list:   ()         => req("/transport"),
  create: (data)     => req("/transport",          { method: "POST",   body: JSON.stringify(data) }),
  update: (id, data) => req(`/transport/${id}`,     { method: "PUT",    body: JSON.stringify(data) }),
  delete: (id)       => req(`/transport/${id}`,     { method: "DELETE" }),
};

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendance = {
  list:     (params = {}) => req("/attendance?" + new URLSearchParams(params)),
  summary:  (params = {}) => req("/attendance/summary?" + new URLSearchParams(params)),
  mark:     (data)        => req("/attendance",        { method: "POST", body: JSON.stringify(data) }),
  markBulk: (records)     => req("/attendance/bulk",   { method: "POST", body: JSON.stringify(records) }),
  // ADD THIS:
  deleteStudent: (studentId, params = {}) => req(`/attendance/${studentId}?` + new URLSearchParams(params), { method: "DELETE" }),
  export:   ()            => req("/export/attendance"),
};


// ── Certificates ──────────────────────────────────────────────────────────────
export const certificates = {
  list:   (params = {}) => req("/certificates?" + new URLSearchParams(params)),
  create: (data)        => req("/certificates",         { method: "POST",   body: JSON.stringify(data) }),
  update: (id, data)    => req(`/certificates/${id}`,    { method: "PUT",    body: JSON.stringify(data) }),
  delete: (id)          => req(`/certificates/${id}`,    { method: "DELETE" }),
};

// ── Publications ──────────────────────────────────────────────────────────────
export const publications = {
  list:   (params = {}) => req("/publications?" + new URLSearchParams(params)),
  create: (data)        => req("/publications",         { method: "POST",   body: JSON.stringify(data) }),
  update: (id, data)    => req(`/publications/${id}`,    { method: "PUT",    body: JSON.stringify(data) }),
  delete: (id)          => req(`/publications/${id}`,    { method: "DELETE" }),
};

// ── Batches ───────────────────────────────────────────────────────────────────
export const batches = {
  list:   (params = {}) => req("/batches?" + new URLSearchParams(params)),
  create: (data)        => req("/batches",        { method: "POST",   body: JSON.stringify(data) }),
  update: (id, data)    => req(`/batches/${id}`,   { method: "PUT",    body: JSON.stringify(data) }),
  delete: (id)          => req(`/batches/${id}`,   { method: "DELETE" }),
};

// ── Alerts ────────────────────────────────────────────────────────────────────
export const alerts = {
  list:   ()     => req("/alerts"),
  create: (data) => req("/alerts",       { method: "POST",   body: JSON.stringify(data) }),
  update: (id, data) => req(`/alerts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id)   => req(`/alerts/${id}`, { method: "DELETE" }),
};

// ── Reports ───────────────────────────────────────────────────────────────────
export const reports = {
  studentAnalytics: () => req("/reports/student-analytics"),
  financial:        () => req("/reports/financial"),
  examResults:      () => req("/reports/exam-results"),
  attendance:       () => req("/reports/attendance"),
  research:         () => req("/reports/research"),
  aicte:            () => req("/reports/aicte"),
};

// ── Export ────────────────────────────────────────────────────────────────────
export const exportData = {
  section: (name) => req(`/export/${name}`),
};

// ── Analytics ────────────────────────────────────────────────────────────────
export const analytics = {
  dashboard: () => req("/analytics/dashboard"),
};

// ── Utility: download blob ────────────────────────────────────────────────────
export function downloadBlob(blob, filename) {
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
