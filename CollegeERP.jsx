import { useState, useEffect, useCallback } from "react";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:         #0a0d12;
      --bg1:        #10151e;
      --bg2:        #161d29;
      --bg3:        #1e2736;
      --border:     rgba(255,255,255,0.07);
      --border-md:  rgba(255,255,255,0.12);
      --gold:       #f0b429;
      --gold-dim:   #7a5a0a;
      --gold-glow:  rgba(240,180,41,0.12);
      --teal:       #00d4a0;
      --teal-dim:   rgba(0,212,160,0.12);
      --blue:       #4da6ff;
      --blue-dim:   rgba(77,166,255,0.12);
      --red:        #ff5c5c;
      --red-dim:    rgba(255,92,92,0.12);
      --purple:     #a78bfa;
      --purple-dim: rgba(167,139,250,0.12);
      --orange:     #fb923c;
      --orange-dim: rgba(251,146,60,0.12);
      --text1:      #f0f4ff;
      --text2:      #8892a4;
      --text3:      #4a5568;
      --radius:     12px;
      --radius-sm:  8px;
      --sidebar:    270px;
      --topbar:     60px;
      --font-head:  'Syne', sans-serif;
      --font-body:  'DM Sans', sans-serif;
      --font-mono:  'JetBrains Mono', monospace;
      --transition: 0.18s cubic-bezier(0.4,0,0.2,1);
    }

    html, body { height: 100%; }
    body { font-family: var(--font-body); background: var(--bg); color: var(--text1); overflow: auto; font-size: 14px; line-height: 1.5; -webkit-font-smoothing: antialiased; }

    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--bg3); border-radius: 2px; }

    /* ── Layout ── */
    .erp { display: flex; height: 100vh; width: 100%; overflow: hidden; }

    /* ── Sidebar ── */
    .sb { width: var(--sidebar); flex-shrink: 0; background: var(--bg1); border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; }
    .sb-brand { padding: 22px 20px 18px; border-bottom: 1px solid var(--border); }
    .sb-tag { font-family: var(--font-mono); font-size: 9px; font-weight: 500; letter-spacing: 2px; color: var(--gold); background: var(--gold-glow); border: 1px solid rgba(240,180,41,0.2); padding: 3px 8px; border-radius: 4px; display: inline-block; margin-bottom: 10px; }
    .sb-name { font-family: var(--font-head); font-size: 16px; font-weight: 700; color: var(--text1); line-height: 1.2; }
    .sb-sub { font-size: 11px; color: var(--text3); margin-top: 4px; }
    .sb-nav { flex: 1; overflow-y: auto; padding: 10px 0; }
    .sb-sec { font-size: 9px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--text3); padding: 14px 20px 5px; }
    .sb-item { display: flex; align-items: center; gap: 10px; padding: 9px 20px; cursor: pointer; font-size: 13px; color: var(--text2); border-left: 2px solid transparent; transition: all var(--transition); position: relative; }
    .sb-item:hover { color: var(--text1); background: var(--bg2); }
    .sb-item.on { color: var(--gold); background: var(--gold-glow); border-left-color: var(--gold); font-weight: 500; }
    .sb-icon { font-size: 14px; width: 18px; text-align: center; flex-shrink: 0; }
    .sb-badge { margin-left: auto; background: rgba(251,146,60,0.2); color: var(--orange); font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 10px; }
    .sb-foot { padding: 14px 20px; border-top: 1px solid var(--border); }
    .sb-user { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .sb-avatar { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, var(--gold-dim), var(--gold)); display: flex; align-items: center; justify-content: center; font-family: var(--font-head); font-size: 13px; font-weight: 700; color: #0a0d12; flex-shrink: 0; }
    .sb-uname { font-size: 13px; font-weight: 600; color: var(--text1); }
    .sb-urole { font-size: 11px; color: var(--text3); }
    .sb-select { width: 100%; background: var(--bg2); border: 1px solid var(--border-md); color: var(--text1); font-family: var(--font-body); font-size: 12px; padding: 8px 10px; border-radius: var(--radius-sm); cursor: pointer; outline: none; transition: border-color var(--transition); appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238892a4' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px; }
    .sb-select:focus { border-color: var(--gold-dim); }
    .sb-select option { background: var(--bg2); }

    /* ── Main ── */
    .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
    .topbar { height: var(--topbar); flex-shrink: 0; background: var(--bg1); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 24px; gap: 12px; }
    .tb-title { font-family: var(--font-head); font-size: 17px; font-weight: 700; color: var(--text1); flex: 1; letter-spacing: -0.3px; }
    .tb-search { display: flex; align-items: center; gap: 8px; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 7px 12px; transition: border-color var(--transition); }
    .tb-search:focus-within { border-color: var(--border-md); }
    .tb-search input { background: none; border: none; outline: none; color: var(--text1); font-family: var(--font-body); font-size: 13px; width: 220px; }
    .tb-search input::placeholder { color: var(--text3); }
    .tb-btn { display: flex; align-items: center; gap: 6px; background: var(--bg2); border: 1px solid var(--border); color: var(--text2); cursor: pointer; font-family: var(--font-body); font-size: 12px; font-weight: 500; padding: 7px 13px; border-radius: var(--radius-sm); transition: all var(--transition); white-space: nowrap; }
    .tb-btn:hover { color: var(--text1); border-color: var(--border-md); }
    .tb-btn.gold { background: linear-gradient(135deg, var(--gold-dim), #b8800a); color: #fff0c0; border-color: rgba(240,180,41,0.3); }
    .tb-btn.gold:hover { filter: brightness(1.15); }
    .tb-notif { position: relative; }
    .tb-dot { position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; border-radius: 50%; background: var(--orange); border: 2px solid var(--bg1); }
    .content { flex: 1; overflow-y: auto; padding: 24px; }

    /* ── Role Banner ── */
    .role-banner { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: var(--radius-sm); margin-bottom: 20px; font-size: 12px; border: 1px solid; }
    .role-banner.admin  { background: var(--gold-glow); border-color: rgba(240,180,41,0.2); color: var(--gold); }
    .role-banner.hod    { background: var(--blue-dim);  border-color: rgba(77,166,255,0.2); color: var(--blue); }
    .role-banner.teach  { background: var(--teal-dim);  border-color: rgba(0,212,160,0.2);  color: var(--teal); }
    .role-banner.support{ background: var(--purple-dim);border-color: rgba(167,139,250,0.2);color: var(--purple); }
    .role-banner.exam   { background: var(--orange-dim);border-color: rgba(251,146,60,0.2); color: var(--orange); }

    /* ── Stats Grid ── */
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px; }
    .stat { background: var(--bg1); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 20px; position: relative; overflow: hidden; cursor: default; transition: transform var(--transition), border-color var(--transition); }
    .stat:hover { transform: translateY(-2px); border-color: var(--border-md); }
    .stat::after { content: ''; position: absolute; inset: 0; opacity: 0; background: radial-gradient(circle at 80% 20%, var(--accent, rgba(240,180,41,0.08)) 0%, transparent 60%); transition: opacity var(--transition); }
    .stat:hover::after { opacity: 1; }
    .stat-stripe { position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: var(--radius) var(--radius) 0 0; }
    .stat-val { font-family: var(--font-head); font-size: 30px; font-weight: 800; color: var(--text1); line-height: 1; }
    .stat-lbl { font-size: 11px; color: var(--text3); margin-top: 5px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-ico { position: absolute; top: 14px; right: 16px; font-size: 22px; opacity: 0.2; }
    .stat-trend { font-size: 11px; margin-top: 8px; color: var(--teal); }

    /* ── Section Layout ── */
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px; }
    .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 18px; }
    .grid1 { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 18px; }

    /* ── Card ── */
    .card { background: var(--bg1); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
    .card-head { padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .card-title { font-size: 13px; font-weight: 600; color: var(--text1); display: flex; align-items: center; gap: 7px; }
    .card-sub { font-size: 11px; color: var(--text3); margin-top: 2px; }
    .card-body { padding: 16px 18px; }

    /* ── Module Icon Grid ── */
    .mod-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 20px; }
    .mod-item { background: var(--bg1); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 8px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; transition: all var(--transition); text-align: center; }
    .mod-item:hover { border-color: var(--gold-dim); background: var(--bg2); transform: translateY(-2px); }
    .mod-ico { font-size: 22px; }
    .mod-lbl { font-size: 10px; color: var(--text2); font-weight: 500; line-height: 1.3; }

    /* ── Table ── */
    .tbl-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { text-align: left; padding: 9px 14px; font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--text3); background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border); white-space: nowrap; }
    tbody tr { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background var(--transition); }
    tbody tr:hover { background: var(--bg2); }
    tbody td { padding: 10px 14px; color: var(--text1); vertical-align: middle; }
    tbody tr:last-child { border-bottom: none; }

    /* ── Badges ── */
    .badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 10px; font-weight: 600; letter-spacing: 0.3px; white-space: nowrap; }
    .b-green  { background: rgba(0,212,160,0.12);  color: #00d4a0; }
    .b-red    { background: rgba(255,92,92,0.12);   color: #ff5c5c; }
    .b-gold   { background: rgba(240,180,41,0.12);  color: var(--gold); }
    .b-blue   { background: rgba(77,166,255,0.12);  color: var(--blue); }
    .b-purple { background: rgba(167,139,250,0.12); color: var(--purple); }
    .b-gray   { background: rgba(255,255,255,0.07); color: var(--text2); }
    .b-orange { background: rgba(251,146,60,0.12);  color: var(--orange); }
    .b-teal   { background: rgba(0,212,160,0.12);   color: var(--teal); }

    /* ── Action Buttons ── */
    .act { border: none; cursor: pointer; border-radius: 6px; font-family: var(--font-body); font-size: 11px; font-weight: 500; padding: 4px 10px; transition: all var(--transition); }
    .act:hover { filter: brightness(1.2); }
    .act-edit { background: var(--blue-dim); color: var(--blue); }
    .act-del  { background: var(--red-dim);  color: var(--red); }
    .act-view { background: var(--teal-dim); color: var(--teal); }
    .act-add  { background: var(--gold-glow);color: var(--gold); }
    .act-ok   { background: var(--purple-dim);color: var(--purple); }

    /* ── Progress Bar ── */
    .pbar { height: 5px; background: var(--bg3); border-radius: 3px; overflow: hidden; }
    .pfill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }

    /* ── Tabs ── */
    .tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 18px; }
    .tab { padding: 10px 16px; font-size: 13px; font-weight: 500; color: var(--text3); cursor: pointer; border-bottom: 2px solid transparent; transition: all var(--transition); }
    .tab:hover { color: var(--text2); }
    .tab.on { color: var(--gold); border-bottom-color: var(--gold); }

    /* ── Pills ── */
    .pills { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
    .pill { padding: 4px 12px; border-radius: 20px; font-size: 11px; cursor: pointer; border: 1px solid var(--border); color: var(--text3); transition: all var(--transition); }
    .pill:hover { border-color: var(--border-md); color: var(--text2); }
    .pill.on { background: var(--gold-glow); border-color: rgba(240,180,41,0.3); color: var(--gold); }

    /* ── Modal ── */
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .modal { background: var(--bg1); border: 1px solid var(--border-md); border-radius: 16px; width: 700px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; animation: slideUp 0.25s; }
    @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:none;opacity:1} }
    .modal-head { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
    .modal-title { font-family: var(--font-head); font-size: 18px; font-weight: 700; }
    .modal-close { background: var(--bg3); border: none; color: var(--text2); font-size: 18px; cursor: pointer; line-height: 1; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all var(--transition); }
    .modal-close:hover { background: var(--red-dim); color: var(--red); }
    .modal-body { padding: 22px 24px; overflow-y: auto; flex: 1; }
    .modal-foot { padding: 14px 24px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; }

    /* ── Forms ── */
    .fg { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .fg-full { grid-column: 1 / -1; }
    .fgrp { display: flex; flex-direction: column; gap: 5px; }
    .fgrp label { font-size: 10px; font-weight: 600; color: var(--text3); letter-spacing: 0.8px; text-transform: uppercase; }
    input, select, textarea { background: var(--bg2); border: 1px solid var(--border); color: var(--text1); font-family: var(--font-body); font-size: 13px; padding: 9px 12px; border-radius: var(--radius-sm); outline: none; transition: border-color var(--transition); width: 100%; }
    input:focus, select:focus, textarea:focus { border-color: var(--gold-dim); }
    textarea { resize: vertical; min-height: 80px; }
    select option { background: var(--bg2); }

    /* ── Buttons ── */
    .btn { border: none; cursor: pointer; border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 13px; font-weight: 600; padding: 9px 18px; transition: all var(--transition); display: inline-flex; align-items: center; gap: 6px; }
    .btn-primary { background: linear-gradient(135deg, #7a5a0a, var(--gold)); color: #0a0d12; }
    .btn-primary:hover { filter: brightness(1.1); }
    .btn-secondary { background: var(--bg2); color: var(--text1); border: 1px solid var(--border); }
    .btn-secondary:hover { border-color: var(--border-md); }
    .btn-danger { background: var(--red-dim); color: var(--red); }
    .btn-sm { padding: 6px 14px; font-size: 12px; }

    /* ── Notifications ── */
    .notif { display: flex; align-items: flex-start; gap: 10px; padding: 11px 14px; border-radius: var(--radius-sm); margin-bottom: 12px; border: 1px solid; font-size: 12px; line-height: 1.5; }
    .notif-warn { background: var(--orange-dim); border-color: rgba(251,146,60,0.25); color: var(--text1); }
    .notif-info { background: var(--blue-dim);   border-color: rgba(77,166,255,0.25); color: var(--text1); }
    .notif-ok   { background: var(--teal-dim);   border-color: rgba(0,212,160,0.25);  color: var(--text1); }
    .notif-err  { background: var(--red-dim);    border-color: rgba(255,92,92,0.25);  color: var(--text1); }
    .notif-ico  { font-size: 14px; margin-top: 1px; flex-shrink: 0; }

    /* ── Timeline ── */
    .tl { display: flex; flex-direction: column; gap: 0; }
    .tl-item { display: flex; gap: 12px; padding-bottom: 14px; position: relative; }
    .tl-item:not(:last-child)::before { content:''; position:absolute; left:13px; top:26px; bottom:0; width:1px; background:var(--border); }
    .tl-dot { width:26px; height:26px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:11px; border:1.5px solid; }
    .tl-gold   { background:rgba(240,180,41,0.12);  border-color:var(--gold); }
    .tl-teal   { background:rgba(0,212,160,0.12);   border-color:var(--teal); }
    .tl-blue   { background:rgba(77,166,255,0.12);  border-color:var(--blue); }
    .tl-red    { background:rgba(255,92,92,0.12);   border-color:var(--red); }
    .tl-purple { background:rgba(167,139,250,0.12); border-color:var(--purple); }
    .tl-content { flex:1; }
    .tl-time { font-size:10px; color:var(--text3); }
    .tl-text { font-size:12px; color:var(--text1); margin-top:2px; line-height:1.5; }

    /* ── Checklist ── */
    .chk-item { display:flex; align-items:flex-start; gap:12px; padding:10px 12px; border-radius:var(--radius-sm); transition:background var(--transition); }
    .chk-item:hover { background:var(--bg2); }

    /* ── Attendance Grid ── */
    .att-cell { width:22px; height:22px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:700; cursor:pointer; transition:all var(--transition); border:1px solid transparent; }
    .att-P { background:rgba(0,212,160,0.2); color:var(--teal); border-color:rgba(0,212,160,0.35); }
    .att-A { background:rgba(255,92,92,0.2); color:var(--red);  border-color:rgba(255,92,92,0.35); }
    .att-H { background:rgba(240,180,41,0.15); color:var(--gold); border-color:rgba(240,180,41,0.3); }
    .att-E { background:var(--bg3); opacity:0.3; }
    .att-cell:hover { transform:scale(1.15); }

    /* ── Page Header ── */
    .ph { margin-bottom: 20px; }
    .ph h1 { font-family: var(--font-head); font-size: 24px; font-weight: 800; color: var(--text1); letter-spacing: -0.5px; }
    .ph p  { font-size: 13px; color: var(--text3); margin-top: 4px; }

    /* ── Empty State ── */
    .empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:50px 20px; color:var(--text3); gap:10px; }
    .empty-ico { font-size:36px; opacity:0.3; }
    .empty p { font-size:13px; }

    /* ── Report Card ── */
    .rep-card { background:var(--bg1); border:1px solid var(--border); border-radius:var(--radius); padding:18px; cursor:pointer; transition:all var(--transition); display:flex; flex-direction:column; gap:10px; }
    .rep-card:hover { border-color:var(--border-md); transform:translateY(-2px); }

    /* ── Access Denied ── */
    .access-denied { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:400px; gap:16px; text-align:center; }
    .access-denied-ico { font-size:48px; opacity:0.3; }
    .access-denied h2 { font-family:var(--font-head); font-size:20px; color:var(--text2); }
    .access-denied p { font-size:13px; color:var(--text3); max-width:340px; }

    /* ── Search highlight ── */
    mark { background: rgba(240,180,41,0.25); color: var(--gold); border-radius: 2px; padding: 0 2px; }

    /* ── Score ring ── */
    .ring { position:relative; width:88px; height:88px; flex-shrink:0; }
    .ring svg { transform:rotate(-90deg); }
    .ring-num { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-family:var(--font-head); font-size:22px; font-weight:800; }

    /* ── Misc ── */
    .mono { font-family:var(--font-mono); font-size:11px; }
    .flex-row { display:flex; align-items:center; gap:10px; }
    .flex-between { display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .mb-4 { margin-bottom:4px; }
    .mb-8 { margin-bottom:8px; }
    .mb-12 { margin-bottom:12px; }
    .mb-16 { margin-bottom:16px; }
    .mb-20 { margin-bottom:20px; }
    .fw6 { font-weight:600; }
    .fs11 { font-size:11px; }
    .fc2 { color:var(--text2); }
    .fc3 { color:var(--text3); }
  `}</style>
);

// ─── Data ──────────────────────────────────────────────────────────────────
const DEPTS = [
  { id:"CSE", name:"Computer Science & Engineering",   hod:"Dr. Ramesh Kumar",   faculty:18, students:480, estd:1995, pg:"M.Tech CSE, Ph.D." },
  { id:"ECE", name:"Electronics & Comm. Engineering",  hod:"Dr. Sunita Rao",     faculty:15, students:360, estd:1997, pg:"M.Tech VLSI" },
  { id:"ME",  name:"Mechanical Engineering",           hod:"Dr. Vijay Patil",    faculty:20, students:420, estd:1992, pg:"M.Tech Thermal" },
  { id:"EEE", name:"Electrical & Electronics Engg.",   hod:"Dr. Pradeep Gupta",  faculty:14, students:300, estd:1998, pg:"M.Tech Power" },
  { id:"IT",  name:"Information Technology",           hod:"Dr. Meena Iyer",     faculty:12, students:240, estd:2001, pg:"MCA" },
  { id:"CE",  name:"Civil Engineering",                hod:"Dr. Anil Mishra",    faculty:16, students:350, estd:1992, pg:"M.Tech Structural" },
];

const INIT_STUDENTS = [
  { id:"S001", name:"Arjun Mehta",   dept:"CSE", year:3, gender:"Male",   dob:"2002-04-15", phone:"9876543210", email:"arjun@uni.ac.in",  status:"Active",   cgpa:8.7, feeStatus:"Paid",    transport:"Route A", guardian:"Suresh Mehta",   address:"12A MG Road, Bengaluru" },
  { id:"S002", name:"Priya Sharma",  dept:"ECE", year:2, gender:"Female", dob:"2003-07-22", phone:"9876543211", email:"priya@uni.ac.in",  status:"Active",   cgpa:9.1, feeStatus:"Paid",    transport:"Route B", guardian:"Rajan Sharma",    address:"45 Koramangala, Bengaluru" },
  { id:"S003", name:"Rahul Verma",   dept:"ME",  year:4, gender:"Male",   dob:"2001-01-10", phone:"9876543212", email:"rahul@uni.ac.in",  status:"Active",   cgpa:7.5, feeStatus:"Pending", transport:"Own",     guardian:"Anil Verma",      address:"7 BTM Layout, Bengaluru" },
  { id:"S004", name:"Sneha Patel",   dept:"CSE", year:1, gender:"Female", dob:"2004-11-03", phone:"9876543213", email:"sneha@uni.ac.in",  status:"Active",   cgpa:8.2, feeStatus:"Paid",    transport:"Route A", guardian:"Kiran Patel",     address:"23 Whitefield, Bengaluru" },
  { id:"S005", name:"Karan Singh",   dept:"EEE", year:3, gender:"Male",   dob:"2002-06-18", phone:"9876543214", email:"karan@uni.ac.in",  status:"Inactive", cgpa:6.9, feeStatus:"Overdue", transport:"Route C", guardian:"Harjit Singh",    address:"56 Marathahalli, Bengaluru" },
  { id:"S006", name:"Divya Nair",    dept:"IT",  year:2, gender:"Female", dob:"2003-09-25", phone:"9876543215", email:"divya@uni.ac.in",  status:"Active",   cgpa:9.4, feeStatus:"Paid",    transport:"Route B", guardian:"Suresh Nair",     address:"8 Electronic City, Bengaluru" },
  { id:"S007", name:"Amit Joshi",    dept:"CE",  year:3, gender:"Male",   dob:"2002-03-11", phone:"9876543216", email:"amit@uni.ac.in",   status:"Active",   cgpa:7.8, feeStatus:"Paid",    transport:"Route D", guardian:"Mohan Joshi",     address:"34 JP Nagar, Bengaluru" },
  { id:"S008", name:"Riya Menon",    dept:"CSE", year:4, gender:"Female", dob:"2001-12-05", phone:"9876543217", email:"riya@uni.ac.in",   status:"Active",   cgpa:8.9, feeStatus:"Paid",    transport:"Own",     guardian:"Thomas Menon",    address:"90 Indiranagar, Bengaluru" },
];

const INIT_STAFF = [
  { id:"T001", name:"Dr. Ramesh Kumar",  dept:"CSE", role:"Professor & HoD",    type:"Teaching", qual:"Ph.D.", exp:22, publications:34, status:"Active", email:"ramesh@uni.ac.in", phone:"9811000001" },
  { id:"T002", name:"Prof. Anita Das",   dept:"CSE", role:"Associate Professor", type:"Teaching", qual:"M.Tech",exp:14, publications:12, status:"Active", email:"anita@uni.ac.in",  phone:"9811000002" },
  { id:"T003", name:"Dr. Sunita Rao",    dept:"ECE", role:"Professor & HoD",    type:"Teaching", qual:"Ph.D.", exp:19, publications:28, status:"Active", email:"sunita@uni.ac.in", phone:"9811000003" },
  { id:"T004", name:"Dr. Vijay Patil",   dept:"ME",  role:"Professor & HoD",    type:"Teaching", qual:"Ph.D.", exp:17, publications:21, status:"Active", email:"vijay@uni.ac.in",  phone:"9811000004" },
  { id:"T005", name:"Dr. Meena Iyer",    dept:"IT",  role:"Professor & HoD",    type:"Teaching", qual:"Ph.D.", exp:15, publications:18, status:"Active", email:"meena@uni.ac.in",  phone:"9811000005" },
  { id:"T006", name:"Prof. Kiran Nair",  dept:"EEE", role:"Assistant Professor", type:"Teaching", qual:"M.Tech",exp:8,  publications:6,  status:"Active", email:"kiran@uni.ac.in",  phone:"9811000006" },
  { id:"S001", name:"Rajesh Nair",       dept:"ADM", role:"Registrar",          type:"Support",  qual:"MBA",  exp:12, publications:0,  status:"Active", email:"reg@uni.ac.in",    phone:"9811000007" },
  { id:"S002", name:"Kavitha M.",        dept:"LIB", role:"Chief Librarian",    type:"Support",  qual:"MLIS", exp:9,  publications:2,  status:"Active", email:"lib@uni.ac.in",    phone:"9811000008" },
  { id:"S003", name:"Suresh P.",         dept:"IT",  role:"System Admin",       type:"Support",  qual:"B.Tech",exp:7, publications:0,  status:"Active", email:"it@uni.ac.in",     phone:"9811000009" },
];

const INIT_COURSES = [
  { code:"CS601", name:"Machine Learning",         dept:"CSE", credits:4, type:"Core",    faculty:"Dr. Ramesh Kumar", sem:6, students:120, syllabus:"ML algorithms, Neural networks, Deep learning fundamentals" },
  { code:"CS502", name:"Database Systems",          dept:"CSE", credits:3, type:"Core",    faculty:"Prof. Anita Das",  sem:5, students:115, syllabus:"SQL, NoSQL, ACID, Normalization, Query optimization" },
  { code:"EC401", name:"VLSI Design",              dept:"ECE", credits:4, type:"Core",    faculty:"Dr. Sunita Rao",   sem:7, students:88,  syllabus:"CMOS design, Layout, RTL synthesis, Timing analysis" },
  { code:"ME301", name:"Fluid Mechanics",          dept:"ME",  credits:3, type:"Core",    faculty:"Dr. Vijay Patil",  sem:3, students:98,  syllabus:"Bernoulli, Reynolds, Pipe flow, Turbomachinery" },
  { code:"CS701", name:"Cloud Computing",          dept:"CSE", credits:3, type:"Elective",faculty:"Prof. Anita Das",  sem:7, students:75,  syllabus:"AWS, Azure, GCP, Microservices, Docker, K8s" },
  { code:"HS101", name:"Engineering Ethics",       dept:"HUM", credits:2, type:"Mandatory",faculty:"Dr. Priya Mohan", sem:1, students:480, syllabus:"Professional responsibility, IPR, Environment ethics" },
  { code:"IT401", name:"Web Technologies",         dept:"IT",  credits:3, type:"Core",    faculty:"Dr. Meena Iyer",   sem:4, students:62,  syllabus:"HTML5, CSS3, React, Node.js, REST APIs" },
  { code:"EE501", name:"Power Systems",            dept:"EEE", credits:4, type:"Core",    faculty:"Prof. Kiran Nair", sem:5, students:78,  syllabus:"Load flow, Fault analysis, Power electronics, Stability" },
];

const INIT_EXAMS = [
  { id:"E001", name:"End Semester — Nov 2024",   dept:"All", type:"Semester",     date:"2024-11-18", status:"Completed", total:1850, hallTickets:true },
  { id:"E002", name:"Mid Semester — Sept 2024",  dept:"All", type:"Mid Term",     date:"2024-09-10", status:"Completed", total:1850, hallTickets:true },
  { id:"E003", name:"Supplementary — Dec 2024",  dept:"All", type:"Supplementary",date:"2024-12-05", status:"Completed", total:140,  hallTickets:true },
  { id:"E004", name:"Internal Assessment — Jan 2025",dept:"CSE",type:"Internal",  date:"2025-01-15", status:"Upcoming",  total:480,  hallTickets:false },
  { id:"E005", name:"End Semester — May 2025",   dept:"All", type:"Semester",     date:"2025-05-12", status:"Scheduled", total:1850, hallTickets:false },
  { id:"E006", name:"Practical Exam — Feb 2025", dept:"CSE", type:"Practical",    date:"2025-02-20", status:"Scheduled", total:480,  hallTickets:false },
];

const INIT_FEES = [
  { id:"F001", type:"Tuition Fee",   amount:125000, freq:"Annual",   dueDate:"2024-07-31", collected:118750, pending:6250 },
  { id:"F002", type:"Hostel Fee",    amount:65000,  freq:"Annual",   dueDate:"2024-07-31", collected:58500,  pending:6500 },
  { id:"F003", type:"Transport Fee", amount:18000,  freq:"Annual",   dueDate:"2024-07-31", collected:16200,  pending:1800 },
  { id:"F004", type:"Lab Fee",       amount:8000,   freq:"Semester", dueDate:"2024-08-15", collected:7600,   pending:400 },
  { id:"F005", type:"Exam Fee",      amount:2500,   freq:"Semester", dueDate:"2024-10-01", collected:2400,   pending:100 },
];

const INIT_ROUTES = [
  { id:"R001", name:"Route A", area:"Koramangala – Indiranagar", stops:8,  students:42, driver:"Ravi Kumar", bus:"KA-01-AB-1234", time:"7:30 AM", contact:"9900001111" },
  { id:"R002", name:"Route B", area:"Whitefield – Marathahalli", stops:6,  students:35, driver:"Suresh M.",  bus:"KA-01-CD-5678", time:"7:45 AM", contact:"9900002222" },
  { id:"R003", name:"Route C", area:"Electronic City – BTM",    stops:10, students:58, driver:"Mahesh P.",  bus:"KA-01-EF-9012", time:"7:15 AM", contact:"9900003333" },
  { id:"R004", name:"Route D", area:"Jayanagar – JP Nagar",     stops:7,  students:29, driver:"Ramesh N.",  bus:"KA-01-GH-3456", time:"7:40 AM", contact:"9900004444" },
];

const CERTS = [
  { id:"C001", type:"Degree Certificate",      student:"Arjun Mehta",  date:"2024-05-20", status:"Issued",  verif:"VER-2024-001" },
  { id:"C002", type:"Provisional Certificate", student:"Priya Sharma", date:"2024-06-01", status:"Issued",  verif:"VER-2024-002" },
  { id:"C003", type:"Bonafide Certificate",    student:"Rahul Verma",  date:"2024-07-10", status:"Issued",  verif:"VER-2024-003" },
  { id:"C004", type:"Transcript",              student:"Sneha Patel",  date:"2024-07-15", status:"Pending", verif:"—" },
  { id:"C005", type:"Migration Certificate",   student:"Karan Singh",  date:"2024-08-01", status:"Issued",  verif:"VER-2024-005" },
];

const PUBS = [
  { id:"P001", title:"Deep Learning for Crop Disease Detection",      author:"Dr. Ramesh Kumar", journal:"IEEE Access",           year:2024, type:"Journal",    impact:3.9 },
  { id:"P002", title:"5G MIMO Antenna Design for mmWave",            author:"Dr. Sunita Rao",   journal:"Springer LNCS",         year:2024, type:"Conference", impact:"—" },
  { id:"P003", title:"Predictive Maintenance in Manufacturing",       author:"Dr. Vijay Patil",  journal:"Int. J. Adv. Manuf.",   year:2023, type:"Journal",    impact:4.2 },
  { id:"P004", title:"Cloud-Native ERP for Academia",                 author:"Dr. Meena Iyer",   journal:"ACM SIGCSE",            year:2024, type:"Conference", impact:"—" },
  { id:"P005", title:"IoT-based Smart Campus Energy Management",      author:"Prof. Kiran Nair", journal:"Energy Reports",        year:2024, type:"Journal",    impact:2.8 },
];

const AICTE = [
  { cat:"Infrastructure", item:"Carpet area per student ≥ 1.5 sq.m",        status:"ok",   note:"Current: 2.1 sq.m" },
  { cat:"Infrastructure", item:"Computer lab ratio 1:2 (student:system)",    status:"ok",   note:"Ratio: 1:1.8" },
  { cat:"Infrastructure", item:"Library with ≥ 2000 titles/dept",            status:"ok",   note:"14,200 titles" },
  { cat:"Faculty",        item:"Faculty:Student ratio ≤ 1:15",               status:"warn", note:"Current 1:18 — action needed" },
  { cat:"Faculty",        item:"≥ 60% Ph.D. qualified faculty",              status:"ok",   note:"67% Ph.D." },
  { cat:"Faculty",        item:"Faculty vacancies ≤ 10%",                    status:"ok",   note:"4% vacant" },
  { cat:"Finances",       item:"Endowment fund ≥ ₹5 Cr",                    status:"ok",   note:"₹8.2 Cr" },
  { cat:"Finances",       item:"Fee refund policy displayed",                 status:"ok",   note:"Published on website" },
  { cat:"Academics",      item:"Outcome Based Education (OBE) implemented",  status:"ok",   note:"All programs" },
  { cat:"Academics",      item:"NBA/NAAC accreditation current",             status:"warn", note:"NAAC expires Mar 2025" },
  { cat:"Academics",      item:"Scopus/SCI publications",                    status:"ok",   note:"62 papers (2024)" },
  { cat:"Compliance",     item:"Anti-ragging committee active",              status:"ok",   note:"Constituted Jun 2024" },
  { cat:"Compliance",     item:"Grievance redressal cell functional",        status:"ok",   note:"Online portal active" },
  { cat:"Compliance",     item:"IQAC active",                               status:"ok",   note:"Minutes updated quarterly" },
  { cat:"Compliance",     item:"Annual reports submitted to AICTE portal",   status:"warn", note:"2023-24 pending upload" },
];

// ─── Role Permissions ─────────────────────────────────────────────────────
const PERMS = {
  Admin:          { pages: ["dashboard","students","departments","staff","courses","exams","attendance","fees","transport","certificates","publications","aicte","reports","alumni"], canEdit: true, canDelete: true, canAdd: true },
  HOD:            { pages: ["dashboard","students","departments","staff","courses","exams","attendance","publications","reports"], canEdit: true, canDelete: false, canAdd: true },
  "Teaching Staff":{ pages: ["dashboard","students","courses","attendance","exams","publications"], canEdit: false, canDelete: false, canAdd: false },
  "Support Staff": { pages: ["dashboard","students","fees","transport","certificates"], canEdit: true, canDelete: false, canAdd: true },
  "Exam Controller":{ pages: ["dashboard","students","exams","attendance","certificates","reports"], canEdit: true, canDelete: false, canAdd: true },
};

const ROLE_INFO = {
  Admin:           { color:"admin",   desc:"Full system access — all modules, edit, add & delete", icon:"🔑" },
  HOD:             { color:"hod",     desc:"Academic modules — students, staff, courses, publications", icon:"🎓" },
  "Teaching Staff":{ color:"teach",   desc:"View only — students, courses, attendance, exams", icon:"👨‍🏫" },
  "Support Staff": { color:"support", desc:"Operations — fees, transport, certificates, student info", icon:"🛠️" },
  "Exam Controller":{ color:"exam",   desc:"Examination modules — exams, certificates, reports", icon:"📝" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, footer }) => (
  <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-head">
        <div className="modal-title">{title}</div>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-foot">{footer}</div>}
    </div>
  </div>
);

const AccessDenied = ({ page }) => (
  <div className="access-denied">
    <div className="access-denied-ico">🔒</div>
    <h2>Access Restricted</h2>
    <p>Your current role does not have permission to access the <strong>{page}</strong> module. Please contact your administrator.</p>
  </div>
);

const RoleBanner = ({ role }) => {
  const info = ROLE_INFO[role];
  return (
    <div className={`role-banner ${info.color}`}>
      <span>{info.icon}</span>
      <span><strong>{role}</strong> — {info.desc}</span>
    </div>
  );
};

const Stat = ({ label, value, color, icon, trend }) => {
  const colors = {
    gold:   { stripe:"linear-gradient(90deg,#7a5a0a,#f0b429)", accent:"rgba(240,180,41,0.08)" },
    teal:   { stripe:"linear-gradient(90deg,#008060,#00d4a0)", accent:"rgba(0,212,160,0.08)" },
    blue:   { stripe:"linear-gradient(90deg,#1a5fa0,#4da6ff)", accent:"rgba(77,166,255,0.08)" },
    purple: { stripe:"linear-gradient(90deg,#5a3fa0,#a78bfa)", accent:"rgba(167,139,250,0.08)" },
    orange: { stripe:"linear-gradient(90deg,#a04010,#fb923c)", accent:"rgba(251,146,60,0.08)" },
    red:    { stripe:"linear-gradient(90deg,#8b0000,#ff5c5c)", accent:"rgba(255,92,92,0.08)" },
  };
  const c = colors[color] || colors.gold;
  return (
    <div className="stat" style={{"--accent": c.accent}}>
      <div className="stat-stripe" style={{background: c.stripe}} />
      <div className="stat-ico">{icon}</div>
      <div className="stat-val">{value}</div>
      <div className="stat-lbl">{label}</div>
      {trend && <div className="stat-trend">↗ {trend}</div>}
    </div>
  );
};

const FormField = ({ label, name, type="text", value, onChange, opts, full }) => (
  <div className={`fgrp${full ? " fg-full" : ""}`}>
    <label>{label}</label>
    {type === "select"
      ? <select name={name} value={value||""} onChange={onChange}>
          {opts.map(o => <option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
        </select>
      : type === "textarea"
      ? <textarea name={name} value={value||""} onChange={onChange} />
      : <input type={type} name={name} value={value||""} onChange={onChange} />
    }
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────
const Dashboard = ({ setPage, students, staff, exams, fees, role }) => {
  const totalFees = fees.reduce((a,f) => a+f.amount, 0);
  const totalCol  = fees.reduce((a,f) => a+f.collected, 0);
  const perms = PERMS[role];
  const allMods = [
    { ico:"🎓", lbl:"Students",    page:"students" },
    { ico:"🏛️",  lbl:"Departments", page:"departments" },
    { ico:"👨‍🏫", lbl:"Staff",       page:"staff" },
    { ico:"📝",  lbl:"Exams",       page:"exams" },
    { ico:"💰",  lbl:"Fees",        page:"fees" },
    { ico:"📖",  lbl:"Courses",     page:"courses" },
    { ico:"✅",  lbl:"Attendance",  page:"attendance" },
    { ico:"🚌",  lbl:"Transport",   page:"transport" },
    { ico:"📜",  lbl:"Certificates",page:"certificates" },
    { ico:"🔬",  lbl:"Publications",page:"publications" },
    { ico:"🏆",  lbl:"AICTE",       page:"aicte" },
    { ico:"📊",  lbl:"Reports",     page:"reports" },
  ].filter(m => perms.pages.includes(m.page));

  return (
    <div>
      <RoleBanner role={role} />
      <div className="ph"><h1>Institution Overview</h1><p>Vidyasagar Deemed University — Academic Year 2024–25</p></div>

      <div className="stats">
        <Stat label="Total Students" value="2,150" color="gold"   icon="🎓" trend="+62 enrolled this year" />
        <Stat label="Faculty Members" value="95"   color="teal"   icon="👨‍🏫" trend="3 joining next month" />
        <Stat label="Departments"     value="6"    color="blue"   icon="🏛️" trend="2 new PG programs" />
        <Stat label="Active Courses"  value="148"  color="purple" icon="📖" trend="8 electives added" />
      </div>

      <div className="mod-grid">
        {allMods.map(m => (
          <div key={m.page} className="mod-item" onClick={() => setPage(m.page)}>
            <div className="mod-ico">{m.ico}</div>
            <div className="mod-lbl">{m.lbl}</div>
          </div>
        ))}
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">💰 Fee Collection 2024–25</div>
              <div className="card-sub">Overall recovery</div>
            </div>
            <span className="badge b-gold">{Math.round((totalCol/totalFees)*100)}% collected</span>
          </div>
          <div className="card-body">
            {fees.map(f => {
              const pct = Math.round((f.collected/f.amount)*100);
              return (
                <div key={f.id} style={{marginBottom:12}}>
                  <div className="flex-between mb-4">
                    <span style={{fontSize:12}}>{f.type}</span>
                    <span className="fc3 fs11">₹{f.collected.toLocaleString()} / ₹{f.amount.toLocaleString()}</span>
                  </div>
                  <div className="pbar">
                    <div className="pfill" style={{width:`${pct}%`, background: pct>=90?"var(--teal)":pct>=70?"var(--gold)":"var(--red)"}} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">🕐 Recent Activity</div></div>
          <div className="card-body">
            <div className="tl">
              {[
                { c:"tl-gold", ico:"📋", t:"Today, 10:32 AM", txt:"End Sem hall tickets generated for 1,850 students" },
                { c:"tl-teal", ico:"✅", t:"Today, 9:15 AM",   txt:"CSE Sem 5 attendance — 47/52 present" },
                { c:"tl-blue", ico:"💳", t:"Yesterday",        txt:"Fee payment received — Arjun Mehta (₹1,25,000)" },
                { c:"tl-red",  ico:"⚠️", t:"2 days ago",       txt:"AICTE: Annual report upload still pending" },
                { c:"tl-teal", ico:"📄", t:"3 days ago",       txt:"Bonafide certificate issued to Rahul Verma" },
              ].map((item,i) => (
                <div key={i} className="tl-item">
                  <div className={`tl-dot ${item.c}`}>{item.ico}</div>
                  <div className="tl-content">
                    <div className="tl-time">{item.t}</div>
                    <div className="tl-text">{item.txt}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div className="card-title">📝 Upcoming Examinations</div></div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Date</th><th>Students</th><th>Status</th></tr></thead>
            <tbody>
              {exams.filter(e => e.status !== "Completed").map(e => (
                <tr key={e.id}>
                  <td><span className="mono">{e.id}</span></td>
                  <td className="fw6">{e.name}</td>
                  <td><span className="badge b-blue">{e.type}</span></td>
                  <td className="fc3 fs11">{e.date}</td>
                  <td>{e.total?.toLocaleString()}</td>
                  <td><span className={`badge ${e.status==="Upcoming"?"b-gold":e.status==="Scheduled"?"b-purple":"b-green"}`}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Students ─────────────────────────────────────────────────────────────
const Students = ({ students, setStudents, role }) => {
  const perms = PERMS[role];
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [yearF, setYearF] = useState("All");
  const [modal, setModal] = useState(null);
  const [viewS, setViewS] = useState(null);
  const [form, setForm] = useState({});

  const depts = ["All", ...DEPTS.map(d => d.id)];
  const filtered = students.filter(s =>
    (filter==="All" || s.dept===filter) &&
    (yearF==="All" || String(s.year)===yearF) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const change = e => setForm(p => ({...p, [e.target.name]: e.target.value}));
  const save = () => {
    if (modal==="add") setStudents(p => [...p, {...form, id:`S${String(p.length+1).padStart(3,"0")}`, year:+form.year, cgpa:+form.cgpa}]);
    else setStudents(p => p.map(s => s.id===form.id ? {...form, year:+form.year, cgpa:+form.cgpa} : s));
    setModal(null);
  };
  const del = id => { if(window.confirm("Delete this student record permanently?")) setStudents(p => p.filter(s => s.id!==id)); };

  return (
    <div>
      <RoleBanner role={role} />
      <div className="ph"><h1>Student Administration</h1><p>Manage student records, profiles and academic status</p></div>

      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <input placeholder="🔍  Search name, ID or email…" value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,minWidth:200}} />
        <select value={yearF} onChange={e=>setYearF(e.target.value)} style={{width:110}}>
          {["All","1","2","3","4"].map(y=><option key={y} value={y}>{y==="All"?"All Years":`Year ${y}`}</option>)}
        </select>
        {perms.canAdd && <button className="btn btn-primary btn-sm" onClick={()=>{setForm({dept:"CSE",year:1,gender:"Male",feeStatus:"Pending",transport:"Own",status:"Active"});setModal("add");}}>+ Add Student</button>}
      </div>

      <div className="pills">
        {depts.map(d=><div key={d} className={`pill${filter===d?" on":""}`} onClick={()=>setFilter(d)}>{d}</div>)}
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">🎓 Students — {filtered.length} records</div>
          <span className="badge b-blue">{filter==="All"?"All Departments":filter}</span>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Dept</th><th>Year</th><th>CGPA</th><th>Fee</th><th>Transport</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(s=>(
                <tr key={s.id}>
                  <td><span className="mono">{s.id}</span></td>
                  <td>
                    <div className="fw6">{s.name}</div>
                    <div className="fc3 fs11">{s.email}</div>
                  </td>
                  <td><span className="badge b-blue">{s.dept}</span></td>
                  <td className="fc2">Yr {s.year}</td>
                  <td><span style={{color:s.cgpa>=8.5?"var(--teal)":s.cgpa>=7?"var(--gold)":"var(--red)",fontWeight:600}}>{s.cgpa}</span></td>
                  <td><span className={`badge ${s.feeStatus==="Paid"?"b-green":s.feeStatus==="Pending"?"b-gold":"b-red"}`}>{s.feeStatus}</span></td>
                  <td className="fc3 fs11">{s.transport}</td>
                  <td><span className={`badge ${s.status==="Active"?"b-green":"b-gray"}`}>{s.status}</span></td>
                  <td>
                    <div style={{display:"flex",gap:4}}>
                      <button className="act act-view" onClick={()=>setViewS(s)}>View</button>
                      {perms.canEdit && <button className="act act-edit" onClick={()=>{setForm({...s});setModal("edit");}}>Edit</button>}
                      {perms.canDelete && <button className="act act-del" onClick={()=>del(s.id)}>Del</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="empty"><div className="empty-ico">🎓</div><p>No students match your filters</p></div>}
        </div>
      </div>

      {/* View Modal */}
      {viewS && (
        <Modal title="Student Profile" onClose={()=>setViewS(null)} footer={<button className="btn btn-secondary" onClick={()=>setViewS(null)}>Close</button>}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {[["Student ID",viewS.id],["Full Name",viewS.name],["Department",viewS.dept],["Year",`Year ${viewS.year}`],["Gender",viewS.gender],["Date of Birth",viewS.dob],["Phone",viewS.phone],["Email",viewS.email],["CGPA",viewS.cgpa],["Fee Status",viewS.feeStatus],["Transport",viewS.transport],["Status",viewS.status],["Guardian",viewS.guardian||"—"],["Address",viewS.address||"—"]].map(([k,v])=>(
              <div key={k} style={{background:"var(--bg2)",borderRadius:"var(--radius-sm)",padding:"10px 12px"}}>
                <div className="fc3 fs11" style={{marginBottom:3}}>{k}</div>
                <div className="fw6" style={{fontSize:13}}>{v}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal==="add"?"Add New Student":"Edit Student"} onClose={()=>setModal(null)}
          footer={<><button className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save Student</button></>}>
          <div className="fg">
            <FormField label="Full Name" name="name" value={form.name} onChange={change} full />
            <FormField label="Department" name="dept" type="select" value={form.dept} onChange={change} opts={DEPTS.map(d=>d.id)} />
            <FormField label="Year" name="year" type="select" value={form.year} onChange={change} opts={[1,2,3,4]} />
            <FormField label="Gender" name="gender" type="select" value={form.gender} onChange={change} opts={["Male","Female","Other"]} />
            <FormField label="Date of Birth" name="dob" type="date" value={form.dob} onChange={change} />
            <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={change} />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={change} full />
            <FormField label="Guardian Name" name="guardian" value={form.guardian} onChange={change} />
            <FormField label="CGPA" name="cgpa" type="number" value={form.cgpa} onChange={change} />
            <FormField label="Fee Status" name="feeStatus" type="select" value={form.feeStatus} onChange={change} opts={["Paid","Pending","Overdue"]} />
            <FormField label="Transport" name="transport" type="select" value={form.transport} onChange={change} opts={["Own","Route A","Route B","Route C","Route D"]} />
            <FormField label="Status" name="status" type="select" value={form.status} onChange={change} opts={["Active","Inactive"]} />
            <FormField label="Address" name="address" type="textarea" value={form.address} onChange={change} full />
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── Departments ──────────────────────────────────────────────────────────
const Departments = ({ role }) => {
  const [sel, setSel] = useState(null);
  return (
    <div>
      <RoleBanner role={role} />
      <div className="ph"><h1>Academic Departments</h1><p>Department details, HOD assignments, faculty and student stats</p></div>
      <div className="stats" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        <Stat label="Departments" value="6"     color="blue"   icon="🏛️" />
        <Stat label="Total Faculty" value="95"  color="gold"   icon="👨‍🏫" />
        <Stat label="Total Students" value="2,150" color="teal" icon="🎓" />
        <Stat label="PG Programs" value="6"    color="purple" icon="🎓" />
      </div>
      <div className="card">
        <div className="card-head"><div className="card-title">🏛️ All Departments</div></div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Code</th><th>Department Name</th><th>HOD</th><th>Faculty</th><th>Students</th><th>PG Programs</th><th>Estd.</th><th>Action</th></tr></thead>
            <tbody>
              {DEPTS.map(d=>(
                <tr key={d.id}>
                  <td><span className="badge b-blue">{d.id}</span></td>
                  <td className="fw6">{d.name}</td>
                  <td style={{fontSize:12}}>{d.hod}</td>
                  <td>{d.faculty}</td>
                  <td>{d.students}</td>
                  <td className="fc3 fs11">{d.pg}</td>
                  <td className="fc3 fs11">{d.estd}</td>
                  <td><button className="act act-view" onClick={()=>setSel(d)}>Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {sel && (
        <Modal title={`${sel.name} — Department Details`} onClose={()=>setSel(null)} footer={<button className="btn btn-secondary" onClick={()=>setSel(null)}>Close</button>}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[["Code",sel.id],["Department",sel.name],["Head of Dept",sel.hod],["Faculty Count",sel.faculty],["Students",sel.students],["Established",sel.estd],["PG Programs",sel.pg]].map(([k,v])=>(
              <div key={k} style={{background:"var(--bg2)",borderRadius:"var(--radius-sm)",padding:"10px 12px"}}>
                <div className="fc3 fs11 mb-4">{k}</div>
                <div className="fw6" style={{fontSize:13}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:16}}>
            <div className="notif notif-info"><span className="notif-ico">ℹ️</span><span>Faculty:Student ratio for {sel.id} is 1:{Math.round(sel.students/sel.faculty)}. AICTE norm: 1:15 for UG programs.</span></div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── Staff ────────────────────────────────────────────────────────────────
const Staff = ({ staff, setStaff, role }) => {
  const perms = PERMS[role];
  const [tab, setTab] = useState("Teaching");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");

  const filtered = staff.filter(s =>
    s.type===tab &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.dept.toLowerCase().includes(search.toLowerCase()))
  );
  const change = e => setForm(p => ({...p, [e.target.name]: e.target.value}));
  const save = () => {
    if (modal==="add") setStaff(p => [...p, {...form, id:`${tab[0]}${String(p.length+1).padStart(3,"0")}`, type:tab, exp:+form.exp, publications:+form.publications||0}]);
    else setStaff(p => p.map(s => s.id===form.id ? {...form, exp:+form.exp, publications:+form.publications} : s));
    setModal(null);
  };

  return (
    <div>
      <RoleBanner role={role} />
      <div className="ph"><h1>Staff Management</h1><p>Teaching faculty and support staff — qualifications, experience, publications</p></div>
      <div className="stats" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        <Stat label="Teaching Faculty" value={staff.filter(s=>s.type==="Teaching").length} color="gold" icon="👨‍🏫" />
        <Stat label="Support Staff" value={staff.filter(s=>s.type==="Support").length} color="teal" icon="🛠️" />
        <Stat label="Ph.D. Holders" value={staff.filter(s=>s.qual==="Ph.D.").length} color="blue" icon="🎓" />
        <Stat label="Avg Experience" value={`${Math.round(staff.reduce((a,s)=>a+(+s.exp||0),0)/staff.length)}y`} color="purple" icon="📅" />
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",gap:0}}>
          <div className="tabs" style={{marginBottom:0,border:"none"}}>
            {["Teaching","Support"].map(t=><div key={t} className={`tab${tab===t?" on":""}`} onClick={()=>setTab(t)}>{t} Staff</div>)}
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:200}} />
          {perms.canAdd && <button className="btn btn-primary btn-sm" onClick={()=>{setForm({dept:"CSE",type:tab,qual:"M.Tech",status:"Active",publications:0});setModal("add");}}>+ Add Staff</button>}
        </div>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Dept</th><th>Role</th><th>Qualification</th><th>Exp.</th>{tab==="Teaching"&&<th>Publications</th>}<th>Contact</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(s=>(
                <tr key={s.id}>
                  <td><span className="mono">{s.id}</span></td>
                  <td>
                    <div className="fw6">{s.name}</div>
                    <div className="fc3 fs11">{s.email}</div>
                  </td>
                  <td><span className="badge b-blue">{s.dept}</span></td>
                  <td className="fs11 fc2">{s.role}</td>
                  <td><span className={`badge ${s.qual==="Ph.D."?"b-gold":"b-gray"}`}>{s.qual}</span></td>
                  <td className="fc2">{s.exp}y</td>
                  {tab==="Teaching"&&<td><span className="badge b-purple">{s.publications}</span></td>}
                  <td className="fc3 fs11">{s.phone}</td>
                  <td><span className={`badge ${s.status==="Active"?"b-green":"b-gray"}`}>{s.status}</span></td>
                  <td>
                    <div style={{display:"flex",gap:4}}>
                      {perms.canEdit && <button className="act act-edit" onClick={()=>{setForm({...s});setModal("edit");}}>Edit</button>}
                      {perms.canDelete && <button className="act act-del" onClick={()=>{if(window.confirm("Remove staff?"))setStaff(p=>p.filter(x=>x.id!==s.id));}}>Del</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="empty"><div className="empty-ico">👨‍🏫</div><p>No {tab} staff found</p></div>}
        </div>
      </div>

      {modal && (
        <Modal title={`${modal==="add"?"Add":"Edit"} ${tab} Staff`} onClose={()=>setModal(null)}
          footer={<><button className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <div className="fg">
            <FormField label="Full Name" name="name" value={form.name} onChange={change} full />
            <FormField label="Department" name="dept" type="select" value={form.dept} onChange={change} opts={[...DEPTS.map(d=>d.id),"ADM","LIB","HUM"]} />
            <FormField label="Role / Designation" name="role" value={form.role} onChange={change} full />
            <FormField label="Qualification" name="qual" type="select" value={form.qual} onChange={change} opts={["Ph.D.","M.Tech","M.E.","MBA","MLIS","B.Tech","MCA"]} />
            <FormField label="Experience (years)" name="exp" type="number" value={form.exp} onChange={change} />
            {tab==="Teaching" && <FormField label="Publications" name="publications" type="number" value={form.publications} onChange={change} />}
            <FormField label="Email" name="email" type="email" value={form.email} onChange={change} />
            <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={change} />
            <FormField label="Status" name="status" type="select" value={form.status} onChange={change} opts={["Active","On Leave","Inactive"]} />
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── Courses ──────────────────────────────────────────────────────────────
const Courses = ({ courses, setCourses, role }) => {
  const perms = PERMS[role];
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [detailC, setDetailC] = useState(null);
  const [form, setForm] = useState({});
  const change = e => setForm(p => ({...p, [e.target.name]: e.target.value}));

  const depts = ["All", ...new Set(courses.map(c=>c.dept))];
  const filtered = courses.filter(c => filter==="All" || c.dept===filter);

  const save = () => {
    if (modal==="add") setCourses(p => [...p, {...form, credits:+form.credits, sem:+form.sem, students:+form.students||0}]);
    else setCourses(p => p.map(c => c.code===form.code ? {...form, credits:+form.credits, sem:+form.sem, students:+form.students} : c));
    setModal(null);
  };

  return (
    <div>
      <RoleBanner role={role} />
      <div className="ph"><h1>Course Structure</h1><p>Curriculum, credits, faculty assignments and syllabi</p></div>
      <div className="stats" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        <Stat label="Total Courses" value={courses.length} color="gold" icon="📖" />
        <Stat label="Core Courses" value={courses.filter(c=>c.type==="Core").length} color="teal" icon="📚" />
        <Stat label="Electives" value={courses.filter(c=>c.type==="Elective").length} color="blue" icon="🎯" />
        <Stat label="Total Credits" value={courses.reduce((a,c)=>a+(+c.credits||0),0)} color="purple" icon="⭐" />
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div className="pills" style={{marginBottom:0}}>
          {depts.map(d=><div key={d} className={`pill${filter===d?" on":""}`} onClick={()=>setFilter(d)}>{d}</div>)}
        </div>
        {perms.canAdd && <button className="btn btn-primary btn-sm" onClick={()=>{setForm({dept:"CSE",credits:3,type:"Core",sem:1,students:0});setModal("add");}}>+ Add Course</button>}
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Code</th><th>Course Name</th><th>Dept</th><th>Sem</th><th>Credits</th><th>Type</th><th>Faculty</th><th>Enrolled</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(c=>(
                <tr key={c.code}>
                  <td><span className="mono">{c.code}</span></td>
                  <td className="fw6">{c.name}</td>
                  <td><span className="badge b-blue">{c.dept}</span></td>
                  <td className="fc2 fs11">Sem {c.sem}</td>
                  <td><span className="badge b-teal">{c.credits} Cr</span></td>
                  <td><span className={`badge ${c.type==="Core"?"b-gold":c.type==="Elective"?"b-purple":"b-gray"}`}>{c.type}</span></td>
                  <td className="fc2 fs11">{c.faculty}</td>
                  <td>{c.students}</td>
                  <td>
                    <div style={{display:"flex",gap:4}}>
                      <button className="act act-view" onClick={()=>setDetailC(c)}>Syllabus</button>
                      {perms.canEdit && <button className="act act-edit" onClick={()=>{setForm({...c});setModal("edit");}}>Edit</button>}
                      {perms.canDelete && <button className="act act-del" onClick={()=>setCourses(p=>p.filter(x=>x.code!==c.code))}>Del</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="empty"><div className="empty-ico">📖</div><p>No courses for this department</p></div>}
        </div>
      </div>

      {detailC && (
        <Modal title={`${detailC.code} — ${detailC.name}`} onClose={()=>setDetailC(null)} footer={<button className="btn btn-secondary" onClick={()=>setDetailC(null)}>Close</button>}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            {[["Course Code",detailC.code],["Department",detailC.dept],["Semester",`Sem ${detailC.sem}`],["Credits",`${detailC.credits} Credits`],["Type",detailC.type],["Enrolled",detailC.students],["Faculty",detailC.faculty]].map(([k,v])=>(
              <div key={k} style={{background:"var(--bg2)",borderRadius:"var(--radius-sm)",padding:"10px 12px"}}>
                <div className="fc3 fs11 mb-4">{k}</div>
                <div className="fw6" style={{fontSize:13}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{background:"var(--bg2)",borderRadius:"var(--radius-sm)",padding:"14px 16px"}}>
            <div className="fc3 fs11 mb-8" style={{fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase"}}>Syllabus Overview</div>
            <div style={{fontSize:13,lineHeight:1.7}}>{detailC.syllabus || "Syllabus not yet uploaded."}</div>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title={`${modal==="add"?"Add New":"Edit"} Course`} onClose={()=>setModal(null)}
          footer={<><button className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save Course</button></>}>
          <div className="fg">
            <FormField label="Course Code" name="code" value={form.code} onChange={change} />
            <FormField label="Course Name" name="name" value={form.name} onChange={change} full />
            <FormField label="Department" name="dept" type="select" value={form.dept} onChange={change} opts={[...DEPTS.map(d=>d.id),"HUM"]} />
            <FormField label="Semester" name="sem" type="select" value={form.sem} onChange={change} opts={[1,2,3,4,5,6,7,8]} />
            <FormField label="Credits" name="credits" type="number" value={form.credits} onChange={change} />
            <FormField label="Type" name="type" type="select" value={form.type} onChange={change} opts={["Core","Elective","Mandatory","Lab"]} />
            <FormField label="Faculty Assigned" name="faculty" value={form.faculty} onChange={change} full />
            <FormField label="Students Enrolled" name="students" type="number" value={form.students} onChange={change} />
            <FormField label="Syllabus Overview" name="syllabus" type="textarea" value={form.syllabus} onChange={change} full />
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── Exams ────────────────────────────────────────────────────────────────
const Exams = ({ exams, setExams, role }) => {
  const perms = PERMS[role];
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({});
  const change = e => setForm(p => ({...p, [e.target.name]: e.target.value}));

  const statuses = ["All","Scheduled","Upcoming","Ongoing","Completed"];
  const filtered = exams.filter(e => filter==="All" || e.status===filter);

  const save = () => {
    if(modal==="add") setExams(p => [...p, {...form, id:`E${String(p.length+1).padStart(3,"0")}`, total:+form.total}]);
    else setExams(p => p.map(e => e.id===form.id ? {...form, total:+form.total} : e));
    setModal(null);
  };

  return (
    <div>
      <RoleBanner role={role} />
      <div className="ph"><h1>Examination Management</h1><p>Schedule, track and manage all examinations</p></div>
      <div className="stats" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        <Stat label="Total Exams" value={exams.length} color="gold" icon="📝" />
        <Stat label="Completed" value={exams.filter(e=>e.status==="Completed").length} color="teal" icon="✅" />
        <Stat label="Upcoming" value={exams.filter(e=>e.status==="Upcoming"||e.status==="Scheduled").length} color="blue" icon="📅" />
        <Stat label="Hall Tickets Issued" value={exams.filter(e=>e.hallTickets).length} color="purple" icon="🎫" />
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div className="pills" style={{marginBottom:0}}>
          {statuses.map(s=><div key={s} className={`pill${filter===s?" on":""}`} onClick={()=>setFilter(s)}>{s}</div>)}
        </div>
        {perms.canAdd && <button className="btn btn-primary btn-sm" onClick={()=>{setForm({dept:"All",type:"Internal",status:"Scheduled",hallTickets:false,total:0});setModal("add");}}>+ Schedule Exam</button>}
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>ID</th><th>Examination Name</th><th>Dept</th><th>Type</th><th>Date</th><th>Students</th><th>Hall Tickets</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(e=>(
                <tr key={e.id}>
                  <td><span className="mono">{e.id}</span></td>
                  <td className="fw6">{e.name}</td>
                  <td><span className="badge b-blue">{e.dept}</span></td>
                  <td><span className="badge b-purple">{e.type}</span></td>
                  <td className="fc3 fs11">{e.date}</td>
                  <td>{e.total?.toLocaleString()}</td>
                  <td>{e.hallTickets ? <span className="badge b-green">Issued</span> : <span className="badge b-gray">Pending</span>}</td>
                  <td><span className={`badge ${e.status==="Completed"?"b-green":e.status==="Upcoming"?"b-gold":e.status==="Ongoing"?"b-orange":"b-blue"}`}>{e.status}</span></td>
                  <td>
                    <div style={{display:"flex",gap:4}}>
                      {perms.canEdit && <button className="act act-edit" onClick={()=>{setForm({...e});setModal("edit");}}>Edit</button>}
                      {perms.canDelete && <button className="act act-del" onClick={()=>setExams(p=>p.filter(x=>x.id!==e.id))}>Del</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="empty"><div className="empty-ico">📝</div><p>No exams match this filter</p></div>}
        </div>
      </div>

      {modal && (
        <Modal title="Examination Details" onClose={()=>setModal(null)}
          footer={<><button className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save Exam</button></>}>
          <div className="fg">
            <FormField label="Exam Name" name="name" value={form.name} onChange={change} full />
            <FormField label="Department" name="dept" type="select" value={form.dept} onChange={change} opts={["All",...DEPTS.map(d=>d.id)]} />
            <FormField label="Exam Type" name="type" type="select" value={form.type} onChange={change} opts={["Semester","Mid Term","Internal","Supplementary","Practical"]} />
            <FormField label="Exam Date" name="date" type="date" value={form.date} onChange={change} />
            <FormField label="Total Students" name="total" type="number" value={form.total} onChange={change} />
            <FormField label="Status" name="status" type="select" value={form.status} onChange={change} opts={["Scheduled","Upcoming","Ongoing","Completed"]} />
            <FormField label="Hall Tickets" name="hallTickets" type="select" value={form.hallTickets} onChange={change} opts={[{v:false,l:"Pending"},{v:true,l:"Issued"}]} />
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── Attendance ───────────────────────────────────────────────────────────
const Attendance = ({ students, role }) => {
  const perms = PERMS[role];
  const [selDept, setSelDept] = useState("CSE");
  const [selMonth, setSelMonth] = useState("Jan 2025");
  const days = Array.from({length:31},(_,i)=>i+1);

  const [att, setAtt] = useState(() => {
    const a = {};
    students.forEach(s => {
      a[s.id] = {};
      days.forEach(d => {
        a[s.id][d] = d>28 ? "E" : d%7===0 ? "H" : Math.random()>0.12 ? "P" : "A";
      });
    });
    return a;
  });

  const toggle = (sid, day) => {
    if (!perms.canEdit) return;
    setAtt(p => ({...p, [sid]: {...p[sid], [day]: p[sid][day]==="P"?"A":p[sid][day]==="A"?"P":p[sid][day]}}));
  };

  const deptStu = students.filter(s => s.dept===selDept);

  return (
    <div>
      <RoleBanner role={role} />
      <div className="ph"><h1>Attendance Management</h1><p>Mark, view and track student attendance — {selMonth}</p></div>

      <div className="notif notif-warn mb-16">
        <span className="notif-ico">⚠️</span>
        <span>Students below <strong>75% attendance</strong> are ineligible for end-semester exams. Cutoff: <strong>15 Feb 2025</strong>. {!perms.canEdit && "You have view-only access."}</span>
      </div>

      <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <select value={selDept} onChange={e=>setSelDept(e.target.value)} style={{width:260}}>
          {DEPTS.map(d=><option key={d.id} value={d.id}>{d.id} — {d.name.split(" ").slice(0,3).join(" ")}</option>)}
        </select>
        <select value={selMonth} onChange={e=>setSelMonth(e.target.value)} style={{width:120}}>
          {["Nov 2024","Dec 2024","Jan 2025","Feb 2025"].map(m=><option key={m}>{m}</option>)}
        </select>
        <div style={{display:"flex",gap:10,alignItems:"center",fontSize:11,color:"var(--text3)",marginLeft:"auto"}}>
          <span style={{display:"inline-block",width:10,height:10,borderRadius:2,background:"rgba(0,212,160,0.3)"}}></span>P = Present
          <span style={{display:"inline-block",width:10,height:10,borderRadius:2,background:"rgba(255,92,92,0.3)",marginLeft:8}}></span>A = Absent
          <span style={{display:"inline-block",width:10,height:10,borderRadius:2,background:"rgba(240,180,41,0.2)",marginLeft:8}}></span>H = Holiday
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">📅 {selDept} — {selMonth}</div>
          <div className="fc3 fs11">{perms.canEdit ? "Click cell to toggle P/A" : "View only"}</div>
        </div>
        <div style={{overflowX:"auto",padding:"12px 14px"}}>
          <table style={{minWidth:960}}>
            <thead>
              <tr>
                <th style={{minWidth:140,textAlign:"left"}}>Student</th>
                {days.map(d=><th key={d} style={{padding:"4px 2px",fontSize:9,textAlign:"center",color:"var(--text3)"}}>{d}</th>)}
                <th style={{minWidth:40}}>%</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deptStu.map(s=>{
                const record = att[s.id]||{};
                const p = Object.values(record).filter(v=>v==="P").length;
                const tot = Object.values(record).filter(v=>v==="P"||v==="A").length;
                const pct = tot ? Math.round((p/tot)*100) : 0;
                return (
                  <tr key={s.id}>
                    <td style={{fontSize:12,fontWeight:600}}>{s.name}</td>
                    {days.map(d=>(
                      <td key={d} style={{padding:"2px 1px"}}>
                        <div className={`att-cell att-${record[d]||"E"}`} onClick={()=>toggle(s.id,d)}>
                          {record[d]==="E" ? "" : record[d]}
                        </div>
                      </td>
                    ))}
                    <td>
                      <span style={{fontWeight:700,fontSize:12,color:pct>=75?"var(--teal)":pct>=60?"var(--gold)":"var(--red)"}}>{pct}%</span>
                    </td>
                    <td>
                      {pct<75 ? <span className="badge b-red">Shortage</span> : <span className="badge b-green">OK</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Fees ─────────────────────────────────────────────────────────────────
const Fees = ({ fees, setFees, role }) => {
  const perms = PERMS[role];
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const change = e => setForm(p => ({...p, [e.target.name]: e.target.value}));
  const tAmt = fees.reduce((a,f)=>a+f.amount,0);
  const tCol = fees.reduce((a,f)=>a+f.collected,0);
  const tPen = fees.reduce((a,f)=>a+f.pending,0);

  const save = () => {
    const f = {...form, amount:+form.amount, collected:+form.collected, pending:+form.pending};
    if(modal==="add") setFees(p=>[...p,{...f,id:`F${String(p.length+1).padStart(3,"0")}`}]);
    else setFees(p=>p.map(x=>x.id===f.id?f:x));
    setModal(null);
  };

  return (
    <div>
      <RoleBanner role={role} />
      <div className="ph"><h1>Fee Management</h1><p>Fee structures, collection status and payment tracking</p></div>
      <div className="stats" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        <Stat label="Total Receivable" value={`₹${(tAmt/100000).toFixed(1)}L`} color="gold"   icon="💰" />
        <Stat label="Collected"        value={`₹${(tCol/100000).toFixed(1)}L`} color="teal"   icon="✅" />
        <Stat label="Pending"          value={`₹${(tPen/1000).toFixed(0)}K`}  color="red"    icon="⏳" />
        <Stat label="Recovery Rate"    value={`${Math.round((tCol/tAmt)*100)}%`} color="blue" icon="📊" />
      </div>

      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
        {perms.canAdd && <button className="btn btn-primary btn-sm" onClick={()=>{setForm({freq:"Annual",collected:0,pending:0});setModal("add");}}>+ Add Fee Type</button>}
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Fee Type</th><th>Amount (₹)</th><th>Frequency</th><th>Due Date</th><th>Collected</th><th>Pending</th><th>Recovery</th><th>Actions</th></tr></thead>
            <tbody>
              {fees.map(f=>{
                const pct = Math.round((f.collected/f.amount)*100);
                return (
                  <tr key={f.id}>
                    <td className="fw6">{f.type}</td>
                    <td>{f.amount.toLocaleString()}</td>
                    <td><span className="badge b-blue">{f.freq}</span></td>
                    <td className="fc3 fs11">{f.dueDate}</td>
                    <td style={{color:"var(--teal)",fontWeight:600}}>{f.collected.toLocaleString()}</td>
                    <td style={{color:f.pending>0?"var(--red)":"var(--teal)",fontWeight:600}}>{f.pending.toLocaleString()}</td>
                    <td style={{minWidth:120}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div className="pbar" style={{flex:1}}>
                          <div className="pfill" style={{width:`${pct}%`,background:pct>=90?"var(--teal)":pct>=70?"var(--gold)":"var(--red)"}} />
                        </div>
                        <span className="fc3 fs11" style={{minWidth:30}}>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{display:"flex",gap:4}}>
                        {perms.canEdit && <button className="act act-edit" onClick={()=>{setForm({...f});setModal("edit");}}>Edit</button>}
                        {perms.canDelete && <button className="act act-del" onClick={()=>setFees(p=>p.filter(x=>x.id!==f.id))}>Del</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={`${modal==="add"?"Add":"Edit"} Fee Type`} onClose={()=>setModal(null)}
          footer={<><button className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <div className="fg">
            <FormField label="Fee Type Name" name="type" value={form.type} onChange={change} full />
            <FormField label="Total Amount (₹)" name="amount" type="number" value={form.amount} onChange={change} />
            <FormField label="Frequency" name="freq" type="select" value={form.freq} onChange={change} opts={["Annual","Semester","Monthly","One-time"]} />
            <FormField label="Due Date" name="dueDate" type="date" value={form.dueDate} onChange={change} />
            <FormField label="Collected (₹)" name="collected" type="number" value={form.collected} onChange={change} />
            <FormField label="Pending (₹)" name="pending" type="number" value={form.pending} onChange={change} />
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── Transport ────────────────────────────────────────────────────────────
const Transport = ({ routes, setRoutes, role }) => {
  const perms = PERMS[role];
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const change = e => setForm(p => ({...p, [e.target.name]: e.target.value}));

  const save = () => {
    if(modal==="add") setRoutes(p=>[...p,{...form,id:`R${String(p.length+1).padStart(3,"0")}`,stops:+form.stops,students:+form.students}]);
    else setRoutes(p=>p.map(r=>r.id===form.id?{...form,stops:+form.stops,students:+form.students}:r));
    setModal(null);
  };

  return (
    <div>
      <RoleBanner role={role} />
      <div className="ph"><h1>Transport Management</h1><p>Bus routes, driver assignments and student transport</p></div>
      <div className="stats" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        <Stat label="Active Routes" value={routes.length} color="gold" icon="🗺️" />
        <Stat label="Total Buses" value={routes.length} color="blue" icon="🚌" />
        <Stat label="Students Enrolled" value={routes.reduce((a,r)=>a+r.students,0)} color="teal" icon="🎓" />
        <Stat label="Total Stops" value={routes.reduce((a,r)=>a+r.stops,0)} color="purple" icon="📍" />
      </div>

      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
        {perms.canAdd && <button className="btn btn-primary btn-sm" onClick={()=>{setForm({stops:0,students:0});setModal("add");}}>+ Add Route</button>}
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Route</th><th>Area Covered</th><th>Stops</th><th>Students</th><th>Driver</th><th>Contact</th><th>Bus No.</th><th>Departure</th><th>Actions</th></tr></thead>
            <tbody>
              {routes.map(r=>(
                <tr key={r.id}>
                  <td><span className="badge b-gold">{r.name}</span></td>
                  <td style={{fontSize:12}}>{r.area}</td>
                  <td>{r.stops}</td>
                  <td>{r.students}</td>
                  <td className="fw6 fs11">{r.driver}</td>
                  <td className="fc3 fs11">{r.contact}</td>
                  <td><span className="mono">{r.bus}</span></td>
                  <td><span className="badge b-teal">{r.time}</span></td>
                  <td>
                    <div style={{display:"flex",gap:4}}>
                      {perms.canEdit && <button className="act act-edit" onClick={()=>{setForm({...r});setModal("edit");}}>Edit</button>}
                      {perms.canDelete && <button className="act act-del" onClick={()=>setRoutes(p=>p.filter(x=>x.id!==r.id))}>Del</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={`${modal==="add"?"Add":"Edit"} Route`} onClose={()=>setModal(null)}
          footer={<><button className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save Route</button></>}>
          <div className="fg">
            <FormField label="Route Name (e.g. Route E)" name="name" value={form.name} onChange={change} />
            <FormField label="Area Covered" name="area" value={form.area} onChange={change} />
            <FormField label="Number of Stops" name="stops" type="number" value={form.stops} onChange={change} />
            <FormField label="Students Enrolled" name="students" type="number" value={form.students} onChange={change} />
            <FormField label="Driver Name" name="driver" value={form.driver} onChange={change} />
            <FormField label="Driver Contact" name="contact" type="tel" value={form.contact} onChange={change} />
            <FormField label="Bus Number" name="bus" value={form.bus} onChange={change} />
            <FormField label="Departure Time" name="time" value={form.time} onChange={change} />
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── Certificates ─────────────────────────────────────────────────────────
const Certificates = ({ students, role }) => {
  const perms = PERMS[role];
  const [certs, setCerts] = useState(CERTS);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const change = e => setForm(p => ({...p, [e.target.name]: e.target.value}));

  const save = () => {
    const verif = form.status==="Issued" ? `VER-${new Date().getFullYear()}-${String(certs.length+1).padStart(3,"0")}` : "—";
    if(modal==="add") setCerts(p=>[...p,{...form,id:`C${String(p.length+1).padStart(3,"0")}`,verif}]);
    else setCerts(p=>p.map(c=>c.id===form.id?{...form,verif:form.status==="Issued"?c.verif||verif:"—"}:c));
    setModal(null);
  };

  return (
    <div>
      <RoleBanner role={role} />
      <div className="ph"><h1>Certificates & Documents</h1><p>Degree, provisional, bonafide certificates and transcripts</p></div>
      <div className="stats" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        <Stat label="Total Issued" value={certs.filter(c=>c.status==="Issued").length} color="gold" icon="📜" />
        <Stat label="Pending" value={certs.filter(c=>c.status==="Pending").length} color="orange" icon="⏳" />
        <Stat label="Verified IDs" value={certs.filter(c=>c.verif!=="—").length} color="teal" icon="✅" />
        <Stat label="Certificate Types" value={new Set(certs.map(c=>c.type)).size} color="blue" icon="📋" />
      </div>

      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
        {perms.canAdd && <button className="btn btn-primary btn-sm" onClick={()=>{setForm({status:"Pending",date:new Date().toISOString().split("T")[0]});setModal("add");}}>+ Issue Certificate</button>}
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Cert ID</th><th>Certificate Type</th><th>Student</th><th>Date</th><th>Verification ID</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {certs.map(c=>(
                <tr key={c.id}>
                  <td><span className="mono">{c.id}</span></td>
                  <td className="fw6">{c.type}</td>
                  <td>{c.student}</td>
                  <td className="fc3 fs11">{c.date}</td>
                  <td><span className="mono fc3">{c.verif}</span></td>
                  <td><span className={`badge ${c.status==="Issued"?"b-green":"b-gold"}`}>{c.status}</span></td>
                  <td>
                    <div style={{display:"flex",gap:4}}>
                      <button className="act act-view">Download</button>
                      {perms.canEdit && <button className="act act-edit" onClick={()=>{setForm({...c});setModal("edit");}}>Edit</button>}
                      {perms.canDelete && <button className="act act-del" onClick={()=>setCerts(p=>p.filter(x=>x.id!==c.id))}>Del</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={`${modal==="add"?"Issue New":"Edit"} Certificate`} onClose={()=>setModal(null)}
          footer={<><button className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <div className="fg">
            <FormField label="Certificate Type" name="type" type="select" value={form.type} onChange={change} opts={["Degree Certificate","Provisional Certificate","Bonafide Certificate","Transcript","Migration Certificate","Character Certificate"]} full />
            <FormField label="Student Name" name="student" type="select" value={form.student} onChange={change} opts={students.map(s=>s.name)} full />
            <FormField label="Issue Date" name="date" type="date" value={form.date} onChange={change} />
            <FormField label="Status" name="status" type="select" value={form.status} onChange={change} opts={["Pending","Issued"]} />
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── Publications ─────────────────────────────────────────────────────────
const Publications = ({ role }) => {
  const perms = PERMS[role];
  const [pubs, setPubs] = useState(PUBS);
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({});
  const change = e => setForm(p => ({...p, [e.target.name]: e.target.value}));

  const types = ["All","Journal","Conference","Book Chapter","Patent"];
  const filtered = pubs.filter(p => filter==="All" || p.type===filter);

  const save = () => {
    const data = {...form, year:+form.year, impact: parseFloat(form.impact)||"—"};
    if(modal==="add") setPubs(p=>[...p,{...data,id:`P${String(p.length+1).padStart(3,"0")}`}]);
    else setPubs(p=>p.map(x=>x.id===data.id?data:x));
    setModal(null);
  };

  const avgImpact = (pubs.filter(p=>typeof p.impact==="number").reduce((a,p)=>a+p.impact,0) / pubs.filter(p=>typeof p.impact==="number").length).toFixed(1);

  return (
    <div>
      <RoleBanner role={role} />
      <div className="ph"><h1>Research & Publications</h1><p>Faculty publications, journals and research output tracking</p></div>
      <div className="stats" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        <Stat label="Total Publications" value={pubs.length} color="gold" icon="📄" />
        <Stat label="Journal Papers" value={pubs.filter(p=>p.type==="Journal").length} color="teal" icon="📰" />
        <Stat label="Conference Papers" value={pubs.filter(p=>p.type==="Conference").length} color="blue" icon="🎤" />
        <Stat label="Avg Impact Factor" value={avgImpact} color="purple" icon="⭐" />
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div className="pills" style={{marginBottom:0}}>
          {types.map(t=><div key={t} className={`pill${filter===t?" on":""}`} onClick={()=>setFilter(t)}>{t}</div>)}
        </div>
        {perms.canAdd && <button className="btn btn-primary btn-sm" onClick={()=>{setForm({type:"Journal",year:2025});setModal("add");}}>+ Add Publication</button>}
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>ID</th><th>Title</th><th>Author(s)</th><th>Journal / Conference</th><th>Year</th><th>Type</th><th>Impact</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p=>(
                <tr key={p.id}>
                  <td><span className="mono">{p.id}</span></td>
                  <td className="fw6" style={{maxWidth:220,fontSize:12}}>{p.title}</td>
                  <td style={{fontSize:12}}>{p.author}</td>
                  <td className="fc3 fs11">{p.journal}</td>
                  <td>{p.year}</td>
                  <td><span className={`badge ${p.type==="Journal"?"b-gold":"b-blue"}`}>{p.type}</span></td>
                  <td>{typeof p.impact==="number"?<span className="badge b-teal">{p.impact}</span>:<span className="fc3">—</span>}</td>
                  <td>
                    <div style={{display:"flex",gap:4}}>
                      {perms.canEdit && <button className="act act-edit" onClick={()=>{setForm({...p,impact:p.impact});setModal("edit");}}>Edit</button>}
                      {perms.canDelete && <button className="act act-del" onClick={()=>setPubs(p2=>p2.filter(x=>x.id!==p.id))}>Del</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="empty"><div className="empty-ico">📄</div><p>No publications found</p></div>}
        </div>
      </div>

      {modal && (
        <Modal title={`${modal==="add"?"Add":"Edit"} Publication`} onClose={()=>setModal(null)}
          footer={<><button className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <div className="fg">
            <FormField label="Paper Title" name="title" value={form.title} onChange={change} full />
            <FormField label="Author(s)" name="author" value={form.author} onChange={change} full />
            <FormField label="Journal / Conference Name" name="journal" value={form.journal} onChange={change} full />
            <FormField label="Year" name="year" type="number" value={form.year} onChange={change} />
            <FormField label="Type" name="type" type="select" value={form.type} onChange={change} opts={["Journal","Conference","Book Chapter","Patent"]} />
            <FormField label="Impact Factor (if applicable)" name="impact" value={form.impact} onChange={change} />
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── AICTE ────────────────────────────────────────────────────────────────
const AICTEModule = ({ role }) => {
  const ok = AICTE.filter(i=>i.status==="ok").length;
  const warn = AICTE.filter(i=>i.status==="warn").length;
  const score = Math.round((ok/AICTE.length)*100);
  const cats = ["All",...new Set(AICTE.map(i=>i.cat))];
  const [selCat, setSelCat] = useState("All");
  const items = AICTE.filter(i=>selCat==="All"||i.cat===selCat);
  const r = 36, circ = 2*Math.PI*r;
  const dash = (score/100)*circ;

  return (
    <div>
      <RoleBanner role={role} />
      <div className="ph"><h1>AICTE Compliance</h1><p>Regulatory readiness, inspection checklist and institutional records</p></div>

      <div className="stats" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        <Stat label="Compliance Score" value={`${score}%`} color="gold" icon="🏆" />
        <Stat label="Compliant" value={ok} color="teal" icon="✅" />
        <Stat label="Warnings" value={warn} color="orange" icon="⚠️" />
        <Stat label="Checkpoints" value={AICTE.length} color="blue" icon="📋" />
      </div>

      {warn>0 && (
        <div className="notif notif-warn mb-16">
          <span className="notif-ico">⚠️</span>
          <span><strong>{warn} compliance warnings</strong> need immediate attention: Faculty:Student ratio, NAAC accreditation renewal, and annual report upload to AICTE portal.</span>
        </div>
      )}

      <div className="grid2">
        <div className="card">
          <div className="card-head">
            <div className="card-title">📋 Compliance Checklist</div>
            <div style={{display:"flex",gap:10,fontSize:11}}>
              <span style={{color:"var(--teal)"}}>✅ {ok}</span>
              <span style={{color:"var(--orange)"}}>⚠️ {warn}</span>
            </div>
          </div>
          <div style={{padding:"10px 4px"}}>
            <div className="pills" style={{padding:"0 14px 10px"}}>
              {cats.map(c=><div key={c} className={`pill${selCat===c?" on":""}`} onClick={()=>setSelCat(c)}>{c}</div>)}
            </div>
            {items.map((item,i)=>(
              <div key={i} className="chk-item">
                <span style={{fontSize:14,flexShrink:0}}>{item.status==="ok"?"✅":"⚠️"}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:500}}>{item.item}</div>
                  <div className="fc3 fs11">{item.cat}</div>
                </div>
                <span className={`badge ${item.status==="ok"?"b-green":"b-orange"}`} style={{fontSize:10,maxWidth:160,textAlign:"right"}}>{item.note}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="card">
            <div className="card-head"><div className="card-title">📅 Inspection Calendar</div></div>
            <div className="card-body">
              <div className="tl">
                {[
                  {c:"tl-red",    ico:"📋", t:"Mar 2025", txt:"NAAC Peer Team Visit — Accreditation Renewal"},
                  {c:"tl-gold",   ico:"📊", t:"Apr 2025", txt:"AICTE Annual Compliance Report Submission"},
                  {c:"tl-blue",   ico:"🏛️",  t:"Jun 2025", txt:"UGC Inspection — Deemed University Review"},
                  {c:"tl-purple", ico:"🔬", t:"Aug 2025", txt:"NBA Technical Review — CSE & ECE Programs"},
                ].map((item,i)=>(
                  <div key={i} className="tl-item">
                    <div className={`tl-dot ${item.c}`}>{item.ico}</div>
                    <div className="tl-content">
                      <div className="tl-time">{item.t}</div>
                      <div className="tl-text">{item.txt}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">🏫 Institution Records</div></div>
            <div className="card-body" style={{padding:"10px 18px"}}>
              {[["Institution Type","Deemed University (De-Novo)"],["AICTE Approval No.","AICTE/FN/1-23456789/2024"],["UGC Recognition","UGC Act 1956, Section 3"],["Established","1992"],["Campus Area","125 Acres"],["Hostels","4 (Boys: 2, Girls: 2)"],["NAAC Grade","A+ (CGPA 3.62)"],["NBA Accredited","CSE, ECE, ME (2022–25)"]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--border)",fontSize:12}}>
                  <span className="fc3">{k}</span>
                  <span className="fw6">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Reports ──────────────────────────────────────────────────────────────
const Reports = ({ role }) => {
  const reps = [
    { ico:"📊", title:"Student Analytics",  desc:"Enrollment, attrition, gender diversity, dept-wise distribution", badge:"Live",     color:"b-teal" },
    { ico:"💰", title:"Financial Report",   desc:"Fee collection, dues, breakup by dept and category",              badge:"Monthly",  color:"b-gold" },
    { ico:"📝", title:"Exam Results",       desc:"Pass/fail analysis, topper lists, backlog tracking",              badge:"Semester", color:"b-blue" },
    { ico:"✅", title:"Attendance Report",  desc:"Dept-wise, student-wise attendance with shortfall alerts",         badge:"Daily",    color:"b-green" },
    { ico:"🔬", title:"Research Output",    desc:"Publications, patents, grants and funded projects",               badge:"Annual",   color:"b-purple" },
    { ico:"🏆", title:"AICTE Data Sheet",  desc:"AQAR data, NIRF rankings, NAAC SSR inputs",                       badge:"Annual",   color:"b-orange" },
  ];
  return (
    <div>
      <RoleBanner role={role} />
      <div className="ph"><h1>Reports & Analytics</h1><p>Generate institutional reports, analytics dashboards and data exports</p></div>
      <div className="grid3">
        {reps.map(r=>(
          <div key={r.title} className="rep-card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <span style={{fontSize:28}}>{r.ico}</span>
              <span className={`badge ${r.color}`}>{r.badge}</span>
            </div>
            <div className="fw6" style={{fontSize:13}}>{r.title}</div>
            <div className="fc3 fs11" style={{lineHeight:1.6}}>{r.desc}</div>
            <button className="act act-view" style={{alignSelf:"flex-start"}}>Generate ↗</button>
          </div>
        ))}
      </div>
      <div className="notif notif-info">
        <span className="notif-ico">ℹ️</span>
        <span>Reports export as PDF, Excel or CSV. Click Generate on any card to produce an up-to-date report.</span>
      </div>
    </div>
  );
};

// ─── Alumni ───────────────────────────────────────────────────────────────
const Alumni = ({ students, role }) => {
  const alumni = students.filter(s=>s.status==="Inactive");
  const [search, setSearch] = useState("");
  const filtered = alumni.filter(a=>a.name.toLowerCase().includes(search.toLowerCase())||a.dept.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <RoleBanner role={role} />
      <div className="ph"><h1>Alumni Management</h1><p>Graduated and inactive students registry</p></div>
      <div className="stats" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
        <Stat label="Total Alumni" value={alumni.length} color="gold" icon="🎓" />
        <Stat label="Departments" value={new Set(alumni.map(a=>a.dept)).size} color="teal" icon="🏛️" />
        <Stat label="Avg CGPA" value={alumni.length?(alumni.reduce((a,x)=>a+x.cgpa,0)/alumni.length).toFixed(1):"—"} color="blue" icon="📊" />
      </div>
      <div style={{marginBottom:14}}>
        <input placeholder="🔍  Search alumni…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:300}} />
      </div>
      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Department</th><th>CGPA</th><th>Graduation</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(a=>(
                <tr key={a.id}>
                  <td><span className="mono">{a.id}</span></td>
                  <td className="fw6">{a.name}</td>
                  <td><span className="badge b-blue">{a.dept}</span></td>
                  <td style={{color:a.cgpa>=8?"var(--teal)":"var(--gold)",fontWeight:600}}>{a.cgpa}</td>
                  <td className="fc3 fs11">AY 2023–24</td>
                  <td><span className="badge b-purple">Alumni</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="empty"><div className="empty-ico">🎓</div><p>No alumni records found</p></div>}
        </div>
      </div>
    </div>
  );
};

// ─── Nav Config ───────────────────────────────────────────────────────────
const NAV = [
  { sec:"Overview", items:[{ id:"dashboard", ico:"🏠", lbl:"Dashboard" }] },
  { sec:"Academic", items:[
    { id:"students",    ico:"🎓", lbl:"Students" },
    { id:"departments", ico:"🏛️",  lbl:"Departments" },
    { id:"staff",       ico:"👨‍🏫", lbl:"Staff" },
    { id:"courses",     ico:"📖", lbl:"Courses" },
    { id:"exams",       ico:"📝", lbl:"Examinations" },
  ]},
  { sec:"Operations", items:[
    { id:"attendance",  ico:"✅", lbl:"Attendance" },
    { id:"fees",        ico:"💰", lbl:"Fee Management" },
    { id:"transport",   ico:"🚌", lbl:"Transport" },
  ]},
  { sec:"Records", items:[
    { id:"certificates",ico:"📜", lbl:"Certificates" },
    { id:"publications",ico:"🔬", lbl:"Publications" },
    { id:"aicte",       ico:"🏆", lbl:"AICTE Compliance" },
    { id:"reports",     ico:"📊", lbl:"Reports" },
    { id:"alumni",      ico:"🎓", lbl:"Alumni" },
  ]},
];

const PAGE_TITLES = { dashboard:"Dashboard", students:"Students", departments:"Departments", staff:"Staff", courses:"Courses", exams:"Examinations", attendance:"Attendance", fees:"Fee Management", transport:"Transport", certificates:"Certificates", publications:"Publications", aicte:"AICTE Compliance", reports:"Reports", alumni:"Alumni" };

// ─── App Root ─────────────────────────────────────────────────────────────
export default function CollegeERP() {
  const [page, setPage] = useState("dashboard");
  const [role, setRole] = useState("Admin");
  const [students, setStudents] = useState(INIT_STUDENTS);
  const [staff, setStaff] = useState(INIT_STAFF);
  const [courses, setCourses] = useState(INIT_COURSES);
  const [exams, setExams] = useState(INIT_EXAMS);
  const [fees, setFees] = useState(INIT_FEES);
  const [routes, setRoutes] = useState(INIT_ROUTES);
  const [search, setSearch] = useState("");

  const perms = PERMS[role];

  // Auto-redirect if current page not allowed for role
  useEffect(() => {
    if (!perms.pages.includes(page)) setPage("dashboard");
  }, [role]);

  const renderPage = () => {
    if (!perms.pages.includes(page)) return <AccessDenied page={PAGE_TITLES[page]} />;
    switch(page) {
      case "dashboard":    return <Dashboard setPage={setPage} students={students} staff={staff} exams={exams} fees={fees} role={role} />;
      case "students":     return <Students students={students} setStudents={setStudents} role={role} />;
      case "departments":  return <Departments role={role} />;
      case "staff":        return <Staff staff={staff} setStaff={setStaff} role={role} />;
      case "courses":      return <Courses courses={courses} setCourses={setCourses} role={role} />;
      case "exams":        return <Exams exams={exams} setExams={setExams} role={role} />;
      case "attendance":   return <Attendance students={students} role={role} />;
      case "fees":         return <Fees fees={fees} setFees={setFees} role={role} />;
      case "transport":    return <Transport routes={routes} setRoutes={setRoutes} role={role} />;
      case "certificates": return <Certificates students={students} role={role} />;
      case "publications": return <Publications role={role} />;
      case "aicte":        return <AICTEModule role={role} />;
      case "reports":      return <Reports role={role} />;
      case "alumni":       return <Alumni students={students} role={role} />;
      default:             return <Dashboard setPage={setPage} students={students} staff={staff} exams={exams} fees={fees} role={role} />;
    }
  };

  return (
    <>
      <GlobalStyles />
      <div className="erp">
        {/* SIDEBAR */}
        <div className="sb">
          <div className="sb-brand">
            <div className="sb-tag">DEEMED UNIV.</div>
            <div className="sb-name">Vidyasagar University</div>
            <div className="sb-sub">Integrated ERP System · v4.0</div>
          </div>

          <div className="sb-nav">
            {NAV.map(sec => {
              const visible = sec.items.filter(i => perms.pages.includes(i.id));
              if (!visible.length) return null;
              return (
                <div key={sec.sec}>
                  <div className="sb-sec">{sec.sec}</div>
                  {visible.map(item => (
                    <div key={item.id} className={`sb-item${page===item.id?" on":""}`} onClick={()=>setPage(item.id)}>
                      <span className="sb-icon">{item.ico}</span>
                      {item.lbl}
                      {item.id==="aicte" && <span className="sb-badge">3⚠</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="sb-foot">
            <div className="sb-user">
              <div className="sb-avatar">{role[0]}</div>
              <div>
                <div className="sb-uname">{role === "Admin" ? "Admin User" : role === "HOD" ? "Dr. Ramesh Kumar" : role === "Teaching Staff" ? "Prof. Anita Das" : role === "Support Staff" ? "Rajesh Nair" : "Exam Controller"}</div>
                <div className="sb-urole">{role} · AY 2024–25</div>
              </div>
            </div>
            <select className="sb-select" value={role} onChange={e=>setRole(e.target.value)}>
              {["Admin","HOD","Teaching Staff","Support Staff","Exam Controller"].map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* MAIN */}
        <div className="main">
          <div className="topbar">
            <div className="tb-title">{PAGE_TITLES[page]||"ERP"}</div>
            <div className="tb-search">
              <span style={{color:"var(--text3)",fontSize:13}}>🔍</span>
              <input placeholder="Search students, staff, courses…" value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            {perms.canAdd && <button className="tb-btn">📥 Import</button>}
            <button className="tb-btn">📤 Export</button>
            <div className="tb-notif">
              <button className="tb-btn gold">🔔 3 Alerts</button>
              <div className="tb-dot" />
            </div>
          </div>
          <div className="content">
            {renderPage()}
          </div>
        </div>
      </div>
    </>
  );
}
