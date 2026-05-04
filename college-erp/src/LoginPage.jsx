// src/LoginPage.jsx
import { useState } from "react";
import { auth, setAuth } from "./api";

const ROLE_CREDENTIALS = [
  { role: "Admin", username: "admin", color: "#f0b429" },
  { role: "HOD", username: "hod", color: "#4da6ff" },
  { role: "Teaching Staff", username: "teacher", color: "#00d4a0" },
  { role: "Support Staff", username: "support", color: "#a78bfa" },
  { role: "Exam Controller", username: "examctrl", color: "#fb923c" },
];

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Logging in with:", username, password);

      const data = await auth.login(username.trim(), password);

      console.log("Response:", data);

      const token = data.token;
      const user = data.user || data;

      setAuth(token, user);

      onLogin(user.role, user.name);

    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (u) => {
    const passwords = { admin: "admin@123", hod: "hod@123", teacher: "teach@123", support: "support@123", examctrl: "exam@123" };
    setUsername(u);
    setPassword(passwords[u] || "");
    setError("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #0a0d12; color: #f0f4ff; overflow: hidden; }

        .login-root {
          display: flex; height: 100vh; width: 100%;
          background: #0a0d12;
          overflow: hidden;
        }

        /* ── Left Panel ── */
        .login-left {
          flex: 1;
          background: linear-gradient(135deg, #eaedf1 0%, #b2c0d8 50%, #f5f7fb 100%);
          display: flex; flex-direction: column; justify-content: center; padding: 60px;
          position: relative; overflow: hidden;
          border-right: 1px solid rgba(255,255,255,0.07);
        }
        .login-left::before {
          content: '';
          position: absolute; top: -200px; left: -200px;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(240,180,41,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .login-left::after {
          content: '';
          position: absolute; bottom: -100px; right: -100px;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(77,166,255,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .ll-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 3px; font-weight: 500;
          color: #f0b429;
          background: rgba(240,180,41,0.1);
          border: 1px solid rgba(240,180,41,0.2);
          padding: 5px 12px; border-radius: 4px;
          display: inline-block; margin-bottom: 24px; width: fit-content;
        }
        .ll-title {
          font-family: 'Syne', sans-serif;
          font-size: 42px; font-weight: 800; line-height: 1.1;
          letter-spacing: -1px; color: #f0f4ff;
          margin-bottom: 16px;
        }
        .ll-title span { color: #f0b429; }
        .ll-sub {
          font-size: 15px; color: #4a5568; line-height: 1.7;
          max-width: 420px; margin-bottom: 48px;
        }

        .ll-stats {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
          max-width: 400px; margin-bottom: 40px;
        }
        .ll-stat {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 16px;
        }
        .ll-stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 800; color: #f0f4ff;
        }
        .ll-stat-lbl { font-size: 10px; color: #4a5568; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.5px; }

        .ll-roles { display: flex; flex-wrap: wrap; gap: 8px; }
        .ll-role-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          font-size: 11px; color: #8892a4;
          cursor: pointer; transition: all 0.18s;
        }
        .ll-role-pill:hover { background: rgba(255,255,255,0.07); color: #f0f4ff; }
        .ll-role-dot { width: 6px; height: 6px; border-radius: 50%; }

        /* ── Right Panel ── */
        .login-right {
          width: 480px; flex-shrink: 0;
          background: #abb2c0;
          display: flex; flex-direction: column; justify-content: center;
          padding: 60px 50px;
        }

        .lr-header { margin-bottom: 36px; }
        .lr-logo {
          width: 52px; height: 52px; border-radius: 14px;
          background: linear-gradient(135deg, #7a5a0a, #f0b429);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 20px;
        }
        .lr-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800; color: #f0f4ff;
          letter-spacing: -0.5px; margin-bottom: 6px;
        }
        .lr-sub { font-size: 13px; color: #b8c3d6; }

        /* Form */
        .login-form { display: flex; flex-direction: column; gap: 18px; }

        .lf-group { display: flex; flex-direction: column; gap: 6px; }
        .lf-label {
          font-size: 10px; font-weight: 600; letter-spacing: 1px;
          text-transform: uppercase; color: #4a5568;
        }
        .lf-input-wrap { position: relative; }
        .lf-input {
          width: 100%;
          background: #d1d7e1;
          border: 1px solid rgba(255,255,255,0.08);
          color: #07080c;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          padding: 12px 42px 12px 16px;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.18s;
        }
        .lf-input:focus { border-color: rgba(240,180,41,0.4); }
        .lf-input::placeholder { color: #2d3748; }
        .lf-icon {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          font-size: 15px; opacity: 0.4; cursor: pointer;
          user-select: none;
        }
        .lf-icon:hover { opacity: 0.8; }

        .lf-error {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,92,92,0.08);
          border: 1px solid rgba(255,92,92,0.2);
          border-radius: 8px; padding: 10px 14px;
          font-size: 12px; color: #ff5c5c;
        }

        .lf-btn {
          background: linear-gradient(135deg, #7a5a0a, #f0b429);
          border: none; border-radius: 10px;
          color: #0a0d12; font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          padding: 14px; cursor: pointer;
          transition: all 0.18s; letter-spacing: 0.3px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .lf-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        .lf-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .spin {
          width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.3);
          border-top-color: rgba(0,0,0,0.8);
          border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Quick access */
        .quick-access { margin-top: 28px; }
        .qa-title {
          font-size: 10px; font-weight: 600; letter-spacing: 1px;
          text-transform: uppercase; color: #2d3748;
          margin-bottom: 12px; text-align: center;
        }
        .qa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .qa-btn {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px; padding: 8px 12px;
          cursor: pointer; transition: all 0.18s;
          display: flex; align-items: center; gap: 8px;
          text-align: left;
        }
        .qa-btn:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); }
        .qa-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .qa-info { flex: 1; min-width: 0; }
        .qa-role { font-size: 11px; font-weight: 600; color: #8892a4; }
        .qa-user { font-size: 10px; color: #2d3748; font-family: 'JetBrains Mono', monospace; }

        .lr-footer {
          margin-top: 24px; text-align: center;
          font-size: 11px; color: #2d3748;
        }
      `}</style>

      <div className="login-root">
        {/* Left panel */}
        <div className="login-left">
          <div className="ll-tag">VIDYASAGAR DEEMED UNIVERSITY</div>
          <div className="ll-title">
            Integrated<br />
            <span>ERP System</span><br />
            v4.0
          </div>
          <div className="ll-sub">
            A unified platform for managing students, faculty, examinations,
            finances, transport and compliance — all in one place.
          </div>

          <div className="ll-stats">
            <div className="ll-stat">
              <div className="ll-stat-num">2,150</div>
              <div className="ll-stat-lbl">Students</div>
            </div>
            <div className="ll-stat">
              <div className="ll-stat-num">95</div>
              <div className="ll-stat-lbl">Faculty</div>
            </div>
            <div className="ll-stat">
              <div className="ll-stat-num">6</div>
              <div className="ll-stat-lbl">Departments</div>
            </div>
          </div>

          <div className="ll-roles">
            {ROLE_CREDENTIALS.map(r => (
              <div key={r.role} className="ll-role-pill" onClick={() => quickFill(r.username)}>
                <div className="ll-role-dot" style={{ background: r.color }} />
                {r.role}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="login-right">
          <div className="lr-header">
            <div className="lr-logo">🏛️</div>
            <div className="lr-title">Welcome back</div>
            <div className="lr-sub">Sign in to access the ERP portal</div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="lf-group">
              <label className="lf-label">Username</label>
              <div className="lf-input-wrap">
                <input
                  className="lf-input"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoFocus
                  required
                />
                <span className="lf-icon">👤</span>
              </div>
            </div>

            <div className="lf-group">
              <label className="lf-label">Password</label>
              <div className="lf-input-wrap">
                <input
                  className="lf-input"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <span className="lf-icon" onClick={() => setShowPass(p => !p)}>
                  {showPass ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            {error && (
              <div className="lf-error">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button className="lf-btn" type="submit" disabled={loading}>
              {loading ? <><div className="spin" />Signing in…</> : <>Sign In →</>}
            </button>
          </form>

          <div className="quick-access">
            <div className="qa-title">Quick Access — Click to fill credentials</div>
            <div className="qa-grid">
              {ROLE_CREDENTIALS.map(r => (
                <button key={r.role} className="qa-btn" type="button" onClick={() => quickFill(r.username)}>
                  <div className="qa-dot" style={{ background: r.color }} />
                  <div className="qa-info">
                    <div className="qa-role">{r.role}</div>
                    <div className="qa-user">{r.username}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lr-footer">
            Academic Year 2025–26 · Vidyasagar University ERP
          </div>
        </div>
      </div>
    </>
  );
}