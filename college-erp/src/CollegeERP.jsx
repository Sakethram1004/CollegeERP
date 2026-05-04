import { useState, useEffect, useCallback, useRef } from "react";
import ReportModal from "./ReportModal";
import {
  students as studentsApi,
  alumni as alumniApi,
  staff as staffApi,
  departments as deptsApi,
  courses as coursesApi,
  exams as examsApi,
  fees as feesApi,
  transport as transportApi,
  attendance as attendanceApi,
  batches as batchesApi,
  alerts as alertsApi,
  API_BASE_LABEL,
  DEMO_MODE,
  getStoredValue,
  setStoredValue,
} from "./api";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:          #f0f2f7;
      --bg1:         #ffffff;
      --bg2:         #f7f8fc;
      --bg3:         #eef0f6;
      --border:      #e2e5ef;
      --border-md:   #d0d4e4;
      --gold:        #d97706;
      --gold-dim:    #b45309;
      --gold-glow:   rgba(217,119,6,0.08);
      --teal:        #0891b2;
      --teal-dim:    rgba(8,145,178,0.10);
      --blue:        #2563eb;
      --blue-dim:    rgba(37,99,235,0.08);
      --red:         #dc2626;
      --red-dim:     rgba(220,38,38,0.08);
      --purple:      #7c3aed;
      --purple-dim:  rgba(124,58,237,0.08);
      --orange:      #ea580c;
      --orange-dim:  rgba(234,88,12,0.08);
      --green:       #16a34a;
      --green-dim:   rgba(22,163,74,0.08);
      --text1:       #0f172a;
      --text2:       #1e293b;
      --text3:       #64748b;
      --text4:       #94a3b8;
      --radius:      12px;
      --radius-sm:   8px;
      --sidebar:     256px;
      --topbar:      60px;
      --font-head:   'Plus Jakarta Sans', sans-serif;
      --font-body:   'Plus Jakarta Sans', sans-serif;
      --font-mono:   'JetBrains Mono', monospace;
      --transition:  0.15s cubic-bezier(0.4,0,0.2,1);
      --shadow-sm:   0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05);
      --shadow:      0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05);
      --shadow-lg:   0 20px 60px rgba(0,0,0,0.12);
    }

    html, body { height: 100%; }
    body {
      font-family: var(--font-body);
      background: var(--bg);
      color: var(--text1);
      overflow: hidden;
      font-size: 14px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-md); border-radius: 3px; }

    .erp { display: flex; height: 100vh; width: 100%; overflow: hidden; }

    .sb {
      width: var(--sidebar);
      flex-shrink: 0;
      background: var(--bg1);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .sb-brand { padding: 20px 18px 16px; border-bottom: 1px solid var(--border); }
    .sb-tag {
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 500;
      letter-spacing: 2px;
      color: var(--blue);
      background: var(--blue-dim);
      border: 1px solid rgba(37,99,235,0.15);
      padding: 3px 8px;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .sb-name { font-family: var(--font-head); font-size: 14px; font-weight: 800; color: var(--text1); line-height: 1.2; }
    .sb-sub { font-size: 10px; color: var(--text3); margin-top: 2px; }
    .sb-nav { flex: 1; overflow-y: auto; padding: 8px 10px; }
    .sb-sec { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text4); padding: 12px 8px 4px; }
    .sb-item {
      display: flex; align-items: center; gap: 9px;
      padding: 7px 10px; cursor: pointer;
      font-size: 13px; font-weight: 500; color: var(--text2);
      border-radius: var(--radius-sm); margin-bottom: 1px;
      transition: all var(--transition);
    }
    .sb-item:hover { background: var(--bg2); color: var(--text1); }
    .sb-item.on { background: var(--blue-dim); color: var(--blue); font-weight: 600; }
    .sb-icon { font-size: 14px; width: 18px; text-align: center; flex-shrink: 0; }
    .sb-badge { margin-left: auto; background: rgba(234,88,12,0.12); color: var(--orange); font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 10px; }
    .sb-foot { padding: 12px 14px; border-top: 1px solid var(--border); }
    .sb-user { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: var(--bg2); border-radius: var(--radius-sm); border: 1px solid var(--border); margin-bottom: 8px; }
    .sb-avatar { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, var(--blue), #6366f1); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #fff; flex-shrink: 0; }
    .sb-uname { font-size: 12px; font-weight: 700; color: var(--text1); }
    .sb-urole { font-size: 10px; color: var(--text3); }

    .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
    .topbar { height: var(--topbar); flex-shrink: 0; background: var(--bg1); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 20px; gap: 10px; box-shadow: var(--shadow-sm); }
    .tb-title { font-family: var(--font-head); font-size: 16px; font-weight: 800; color: var(--text1); flex: 1; letter-spacing: -0.3px; }
    .tb-search {
      display: flex; align-items: center; gap: 8px;
      background: var(--bg2); border: 1px solid var(--border);
      border-radius: var(--radius-sm); padding: 7px 12px;
      transition: border-color var(--transition), box-shadow var(--transition);
      min-width: 220px; position: relative;
    }
    .tb-search:focus-within { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    .tb-search input { background: none; border: none; outline: none; color: var(--text1); font-family: var(--font-body); font-size: 12px; width: 180px; }
    .tb-search input::placeholder { color: var(--text4); }
    .search-results { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: var(--bg1); border: 1px solid var(--border); border-radius: var(--radius-sm); z-index: 999; max-height: 280px; overflow-y: auto; box-shadow: var(--shadow-lg); }
    .search-result-item { padding: 9px 14px; font-size: 12px; cursor: pointer; border-bottom: 1px solid var(--border); transition: background var(--transition); display: flex; align-items: center; gap: 10px; }
    .search-result-item:hover { background: var(--bg2); }
    .search-result-item:last-child { border-bottom: none; }
    .tb-btn { display: flex; align-items: center; gap: 6px; background: var(--bg2); border: 1px solid var(--border); color: var(--text2); cursor: pointer; font-family: var(--font-body); font-size: 12px; font-weight: 600; padding: 7px 12px; border-radius: var(--radius-sm); transition: all var(--transition); white-space: nowrap; }
    .tb-btn:hover { background: var(--bg3); border-color: var(--border-md); color: var(--text1); }
    .tb-btn.accent { background: var(--blue); color: #fff; border-color: var(--blue); }
    .tb-btn.accent:hover { background: #1d4ed8; }
    .tb-notif { position: relative; }
    .tb-dot { position: absolute; top: -2px; right: -2px; width: 7px; height: 7px; border-radius: 50%; background: var(--orange); border: 2px solid var(--bg1); }
    .content { flex: 1; overflow-y: auto; padding: 22px; }

    .role-banner { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 18px; font-size: 12px; border: 1px solid; font-weight: 500; }
    .role-banner.admin   { background: rgba(37,99,235,0.06);   border-color: rgba(37,99,235,0.15);  color: var(--blue); }
    .role-banner.hod     { background: rgba(8,145,178,0.06);   border-color: rgba(8,145,178,0.15);  color: var(--teal); }
    .role-banner.teach   { background: rgba(22,163,74,0.06);   border-color: rgba(22,163,74,0.15);  color: var(--green); }
    .role-banner.support { background: rgba(124,58,237,0.06);  border-color: rgba(124,58,237,0.15); color: var(--purple); }
    .role-banner.exam    { background: rgba(217,119,6,0.06);   border-color: rgba(217,119,6,0.15);  color: var(--gold); }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat { background: var(--bg1); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 18px; position: relative; overflow: hidden; cursor: default; transition: transform var(--transition), box-shadow var(--transition); box-shadow: var(--shadow-sm); }
    .stat:hover { transform: translateY(-1px); box-shadow: var(--shadow); }
    .stat-stripe { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
    .stat-val { font-family: var(--font-head); font-size: 26px; font-weight: 800; color: var(--text1); line-height: 1; letter-spacing: -1px; margin-top: 6px; }
    .stat-lbl { font-size: 11px; color: var(--text3); margin-top: 5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-ico { position: absolute; top: 14px; right: 14px; font-size: 18px; opacity: 0.18; }
    .stat-trend { font-size: 11px; margin-top: 6px; color: var(--green); font-weight: 600; }

    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
    .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 16px; }

    .card { background: var(--bg1); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); margin-bottom: 16px; }
    .card-head { padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 12px; background: var(--bg2); }
    .card-title { font-size: 13px; font-weight: 700; color: var(--text1); display: flex; align-items: center; gap: 7px; }
    .card-sub { font-size: 11px; color: var(--text3); margin-top: 2px; }
    .card-body { padding: 16px 18px; }

    .mod-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; margin-bottom: 18px; }
    .mod-item { background: var(--bg1); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 8px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; transition: all var(--transition); text-align: center; box-shadow: var(--shadow-sm); }
    .mod-item:hover { border-color: var(--blue); background: var(--blue-dim); transform: translateY(-2px); box-shadow: var(--shadow); }
    .mod-ico { font-size: 20px; }
    .mod-lbl { font-size: 10px; color: var(--text2); font-weight: 600; line-height: 1.3; }

    .tbl-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { text-align: left; padding: 9px 14px; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: var(--text3); background: var(--bg2); border-bottom: 1px solid var(--border); white-space: nowrap; }
    tbody tr { border-bottom: 1px solid var(--border); transition: background var(--transition); }
    tbody tr:hover { background: var(--bg2); }
    tbody td { padding: 10px 14px; color: var(--text1); vertical-align: middle; }
    tbody tr:last-child { border-bottom: none; }

    .badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: 0.2px; white-space: nowrap; }
    .b-green  { background: rgba(22,163,74,0.1);    color: var(--green);  border: 1px solid rgba(22,163,74,0.2); }
    .b-red    { background: var(--red-dim);          color: var(--red);    border: 1px solid rgba(220,38,38,0.2); }
    .b-gold   { background: var(--gold-glow);        color: var(--gold);   border: 1px solid rgba(217,119,6,0.2); }
    .b-blue   { background: var(--blue-dim);         color: var(--blue);   border: 1px solid rgba(37,99,235,0.2); }
    .b-purple { background: var(--purple-dim);       color: var(--purple); border: 1px solid rgba(124,58,237,0.2); }
    .b-gray   { background: var(--bg3);              color: var(--text3);  border: 1px solid var(--border); }
    .b-orange { background: var(--orange-dim);       color: var(--orange); border: 1px solid rgba(234,88,12,0.2); }
    .b-teal   { background: var(--teal-dim);         color: var(--teal);   border: 1px solid rgba(8,145,178,0.2); }

    .act { border: 1px solid transparent; cursor: pointer; border-radius: 6px; font-family: var(--font-body); font-size: 11px; font-weight: 600; padding: 4px 10px; transition: all var(--transition); }
    .act-edit   { background: var(--blue-dim);    color: var(--blue);    border-color: rgba(37,99,235,0.2); }
    .act-del    { background: var(--red-dim);     color: var(--red);     border-color: rgba(220,38,38,0.2); }
    .act-view   { background: var(--teal-dim);    color: var(--teal);    border-color: rgba(8,145,178,0.2); }
    .act-add    { background: var(--gold-glow);   color: var(--gold);    border-color: rgba(217,119,6,0.2); }
    .act-ok     { background: var(--purple-dim);  color: var(--purple);  border-color: rgba(124,58,237,0.2); }
    .act:hover  { opacity: 0.8; transform: scale(1.02); }

    .pbar { height: 5px; background: var(--bg3); border-radius: 3px; overflow: hidden; }
    .pfill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }

    .tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 16px; gap: 4px; }
    .tab { padding: 9px 16px; font-size: 13px; font-weight: 600; color: var(--text3); cursor: pointer; border-bottom: 2px solid transparent; transition: all var(--transition); margin-bottom: -1px; }
    .tab:hover { color: var(--text1); }
    .tab.on { color: var(--blue); border-bottom-color: var(--blue); }

    .pills { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
    .pill { padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); color: var(--text3); background: var(--bg1); transition: all var(--transition); }
    .pill:hover { border-color: var(--blue); color: var(--blue); }
    .pill.on { background: var(--blue-dim); border-color: rgba(37,99,235,0.3); color: var(--blue); }

    .overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.15s; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .modal { background: var(--bg1); border: 1px solid var(--border); border-radius: 16px; width: 680px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; animation: slideUp 0.2s cubic-bezier(0.34,1.4,0.64,1); box-shadow: var(--shadow-lg); }
    @keyframes slideUp { from{transform:translateY(20px) scale(0.97);opacity:0} to{transform:none;opacity:1} }
    .modal-head { padding: 18px 22px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--bg2); border-radius: 16px 16px 0 0; }
    .modal-title { font-family: var(--font-head); font-size: 16px; font-weight: 800; color: var(--text1); }
    .modal-close { background: var(--bg3); border: 1px solid var(--border); color: var(--text3); font-size: 16px; cursor: pointer; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all var(--transition); }
    .modal-close:hover { background: var(--red-dim); color: var(--red); border-color: rgba(220,38,38,0.2); }
    .modal-body { padding: 20px 22px; overflow-y: auto; flex: 1; }
    .modal-foot { padding: 14px 22px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; background: var(--bg2); border-radius: 0 0 16px 16px; }

    .fg { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .fg-full { grid-column: 1 / -1; }
    .fgrp { display: flex; flex-direction: column; gap: 5px; }
    .fgrp label { font-size: 11px; font-weight: 700; color: var(--text3); letter-spacing: 0.5px; text-transform: uppercase; }
    input[type="text"], input[type="number"], input[type="email"], input[type="tel"], input[type="date"], select, textarea { background: var(--bg1); border: 1.5px solid var(--border); color: var(--text1); font-family: var(--font-body); font-size: 13px; padding: 8px 12px; border-radius: var(--radius-sm); outline: none; transition: border-color var(--transition), box-shadow var(--transition); width: 100%; }
    input:focus, select:focus, textarea:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    textarea { resize: vertical; min-height: 80px; }
    select option { background: var(--bg1); }

    .btn { border: none; cursor: pointer; border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 13px; font-weight: 700; padding: 9px 18px; transition: all var(--transition); display: inline-flex; align-items: center; gap: 6px; }
    .btn-primary { background: var(--blue); color: #fff; box-shadow: 0 2px 8px rgba(37,99,235,0.25); }
    .btn-primary:hover { background: #1d4ed8; box-shadow: 0 4px 14px rgba(37,99,235,0.3); }
    .btn-secondary { background: var(--bg2); color: var(--text1); border: 1.5px solid var(--border); }
    .btn-secondary:hover { background: var(--bg3); border-color: var(--border-md); }
    .btn-danger { background: var(--red-dim); color: var(--red); border: 1.5px solid rgba(220,38,38,0.2); }
    .btn-sm { padding: 6px 14px; font-size: 12px; }

    .notif { display: flex; align-items: flex-start; gap: 10px; padding: 11px 14px; border-radius: var(--radius-sm); margin-bottom: 12px; border: 1px solid; font-size: 12px; line-height: 1.5; }
    .notif-warn { background: rgba(217,119,6,0.06); border-color: rgba(217,119,6,0.2); color: var(--text1); }
    .notif-info { background: var(--blue-dim);      border-color: rgba(37,99,235,0.2);  color: var(--text1); }
    .notif-ok   { background: rgba(22,163,74,0.06); border-color: rgba(22,163,74,0.2);  color: var(--text1); }
    .notif-err  { background: var(--red-dim);       border-color: rgba(220,38,38,0.2);  color: var(--text1); }
    .notif-ico  { font-size: 14px; margin-top: 1px; flex-shrink: 0; }

    .tl { display: flex; flex-direction: column; }
    .tl-item { display: flex; gap: 12px; padding-bottom: 14px; position: relative; }
    .tl-item:not(:last-child)::before { content:''; position:absolute; left:12px; top:26px; bottom:0; width:1px; background:var(--border); }
    .tl-dot { width:25px; height:25px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:11px; border:1.5px solid; }
    .tl-blue   { background:var(--blue-dim);   border-color:var(--blue); }
    .tl-teal   { background:var(--teal-dim);   border-color:var(--teal); }
    .tl-green  { background:rgba(22,163,74,0.1); border-color:var(--green); }
    .tl-red    { background:var(--red-dim);    border-color:var(--red); }
    .tl-purple { background:var(--purple-dim); border-color:var(--purple); }
    .tl-gold   { background:var(--gold-glow);  border-color:var(--gold); }
    .tl-content { flex:1; }
    .tl-time { font-size:10px; color:var(--text3); font-weight:600; }
    .tl-text { font-size:12px; color:var(--text1); margin-top:2px; line-height:1.5; }

    .ph { margin-bottom: 18px; }
    .ph h1 { font-family: var(--font-head); font-size: 20px; font-weight: 800; color: var(--text1); letter-spacing: -0.4px; }
    .ph p { font-size: 12px; color: var(--text3); margin-top: 3px; font-weight: 500; }

    .empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:50px 20px; color:var(--text3); gap:10px; }
    .empty-ico { font-size:36px; opacity:0.3; }
    .empty p { font-size:13px; }

    .rep-card { background: var(--bg1); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; cursor: pointer; transition: all var(--transition); display: flex; flex-direction: column; gap: 10px; box-shadow: var(--shadow-sm); }
    .rep-card:hover { border-color: var(--blue); transform: translateY(-2px); box-shadow: var(--shadow); }

    .access-denied { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:400px; gap:16px; text-align:center; }
    .access-denied-ico { font-size:48px; opacity:0.2; }
    .access-denied h2 { font-family:var(--font-head); font-size:20px; color:var(--text2); font-weight:800; }
    .access-denied p { font-size:13px; color:var(--text3); max-width:340px; }

    .mono { font-family:var(--font-mono); font-size:11px; color:var(--text3); }
    .flex-row { display:flex; align-items:center; gap:10px; }
    .flex-between { display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .mb-4  { margin-bottom:4px; }
    .mb-8  { margin-bottom:8px; }
    .mb-12 { margin-bottom:12px; }
    .mb-16 { margin-bottom:16px; }
    .fw6   { font-weight:600; }
    .fw7   { font-weight:700; }
    .fs11  { font-size:11px; }
    .fc2   { color:var(--text2); }
    .fc3   { color:var(--text3); }

    .drop-zone { border: 2px dashed var(--border-md); border-radius: var(--radius); padding: 40px 20px; text-align: center; cursor: pointer; transition: all var(--transition); }
    .drop-zone:hover, .drop-zone.drag-over { border-color: var(--blue); background: var(--blue-dim); }
    .drop-zone p { font-size: 13px; color: var(--text3); margin-top: 8px; }

    .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
    .toast { background: var(--bg1); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 16px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px; box-shadow: var(--shadow-lg); animation: slideUp 0.2s; min-width: 250px; color: var(--text1); }
    .toast-ok   { border-left: 3px solid var(--green); }
    .toast-err  { border-left: 3px solid var(--red); }
    .toast-info { border-left: 3px solid var(--blue); }

    /* ── ATTENDANCE GRID ── */
    .att-card { overflow: hidden; }
    .att-card .card-head { border-radius: var(--radius) var(--radius) 0 0; }
    .att-sheet {
      display: flex;
      align-items: stretch;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      overflow: hidden;
      background: var(--bg1);
    }
    .att-fixed {
      flex: 0 0 220px;
      width: 220px;
      border-right: 1px solid var(--border);
      background: var(--bg1);
      position: relative;
      z-index: 2;
    }
    .att-fixed::after {
      content: "";
      position: absolute;
      top: 0;
      right: -1px;
      width: 14px;
      height: 100%;
      background: linear-gradient(90deg, rgba(255,255,255,0), var(--bg1));
      pointer-events: none;
    }
    .att-scroll {
      flex: 1;
      min-width: 0;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      background: var(--bg1);
    }
    .att-grid-wrap {
      padding: 8px;
    }
    .att-table {
      border-collapse: separate;
      border-spacing: 0;
      width: 100%;
      table-layout: fixed;
    }
    .att-table th { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text3); padding: 8px 4px; text-align: center; background: var(--bg2); border-bottom: 1px solid var(--border); white-space: nowrap; }
    .att-table th.att-name-h { text-align: left; padding-left: 14px; min-width: 220px; width: 220px; }
    .att-table td { padding: 5px 3px; vertical-align: middle; border-bottom: 1px solid var(--border); }
    .att-table td.att-name-c {
      padding: 10px 14px;
      font-size: 12px;
      font-weight: 600;
      background: var(--bg1);
      min-width: 220px;
      max-width: 220px;
    }
    .att-table tr:hover td { background: var(--bg2); }
    .att-table tr:hover td.att-name-c { background: var(--bg2); }
    .att-table tr:last-child td { border-bottom: none; }
    .att-day-th { width: 36px; min-width: 36px; max-width: 36px; }
    .att-day-th.sun { background: rgba(220,38,38,0.06) !important; color: var(--red) !important; }
    .att-cell-td { width: 36px; min-width: 36px; max-width: 36px; text-align: center; }
    .att-cell-td.sun-col { background: rgba(220,38,38,0.04); }
    .att-pct { font-size: 11px; font-weight: 700; text-align: center; padding: 0 6px; }
    .att-status-td { padding: 0 6px; }

    /* ── ATTENDANCE DAY CELLS (updated to match reference style) ── */
    .att-day {
      width: 30px; height: 30px; border-radius: 7px;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 800; cursor: pointer;
      transition: all var(--transition);
      border: 1px solid transparent;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18);
      user-select: none;
    }
    .att-day.present  { background: #baf2e5; color: #0f766e; border-color: #67d9bf; }
    .att-day.absent   { background: #fecaca; color: #b91c1c; border-color: #fca5a5; }
    .att-day.holiday  { background: #fef3c7; color: #b45309; border-color: #fcd34d; }
    .att-day.empty    { background: #e2e8f0; color: var(--text3); border-color: #cbd5e1; cursor: not-allowed; }
    .att-day.sun      { background: #f1f5f9; color: #94a3b8; border-color: #cbd5e1; cursor: not-allowed; }
    .att-day.future   { background: #f8fafc; color: #cbd5e1; border-color: #e2e8f0; cursor: not-allowed; font-size:14px; }
    .att-day:not(.empty):not(.sun):not(.future):hover { transform: scale(1.2); box-shadow: 0 2px 6px rgba(0,0,0,0.12); }

    @supports (-webkit-touch-callout: none) {
      .att-card { overflow: hidden; }
      .att-table th.att-name-h,
      .att-table td.att-name-c {
        position: static;
        box-shadow: none;
      }
    }

    .chk-item { display:flex; align-items:flex-start; gap:12px; padding:10px 12px; border-radius:var(--radius-sm); transition:background var(--transition); }
    .chk-item:hover { background:var(--bg2); }

    /* ── AICTE GRID ── */
    .aicte-section { margin-bottom: 20px; }
    .aicte-section-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 16px;
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius) var(--radius) 0 0;
      border-bottom: none;
    }
    .aicte-section-title { font-size: 13px; font-weight: 700; color: var(--text1); display: flex; align-items: center; gap: 8px; }
    .aicte-items-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      border: 1px solid var(--border);
      border-radius: 0 0 var(--radius) var(--radius);
      overflow: hidden;
    }
    .aicte-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
      border-right: 1px solid var(--border);
      background: var(--bg1);
      transition: background var(--transition);
    }
    .aicte-item:hover { background: var(--bg2); }
    .aicte-item:nth-child(2n) { border-right: none; }
    .aicte-item:nth-last-child(-n+2) { border-bottom: none; }
    .aicte-item-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
    .aicte-item-body { flex: 1; min-width: 0; }
    .aicte-item-text { font-size: 12px; font-weight: 600; color: var(--text1); line-height: 1.4; margin-bottom: 4px; }
    .aicte-item-note { font-size: 10px; color: var(--text3); }
    .aicte-item-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

    /* ── FEE STUDENT TABLE ── */
    .fee-status-paid    { color: var(--green); font-weight: 700; }
    .fee-status-pending { color: var(--gold);  font-weight: 700; }
    .fee-status-overdue { color: var(--red);   font-weight: 700; }

      .alumni-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 14px;
    margin-bottom: 16px;
  }
  .alumni-card {
    background: var(--bg1);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: transform var(--transition), box-shadow var(--transition);
    cursor: default;
  }
  .alumni-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
  .alumni-card-header {
    padding: 16px 18px 12px;
    background: linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .alumni-avatar {
    width: 44px; height: 44px; border-radius: 12px;
    background: linear-gradient(135deg, var(--blue), #6366f1);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 800; color: #fff; flex-shrink: 0;
  }
  .alumni-card-body { padding: 14px 18px; display: flex; flex-direction: column; gap: 8px; }
  .alumni-info-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
  .alumni-info-icon { font-size: 13px; width: 18px; flex-shrink: 0; text-align: center; }
  .alumni-work-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08));
    border: 1px solid rgba(37,99,235,0.18);
    border-radius: 8px; padding: 6px 10px; font-size: 11px; font-weight: 600;
    color: var(--blue); margin-top: 4px;
  }
  .alumni-not-working {
    font-size: 11px; color: var(--text4); font-style: italic;
  }

  /* ── BATCH STUDENT TABLE ── */
  .batch-student-tag {
    display: inline-flex; align-items: center; gap: 4px;
    background: var(--blue-dim); border: 1px solid rgba(37,99,235,0.2);
    color: var(--blue); font-size: 10px; font-weight: 700;
    padding: 2px 7px; border-radius: 12px;
  }
  .batch-filter-bar {
    display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; align-items: center;
  }
  
  `}</style>
);

// ─── DATA ──────────────────────────────────────────────────────────────────
const DEPTS = [
  { id: "CSE", name: "Computer Science & Engineering", hod: "Dr. Ramesh Kumar", faculty: 18, students: 480, estd: 1995, pg: "M.Tech CSE, Ph.D.", category: "Academic" },
  { id: "ECE", name: "Electronics & Comm. Engineering", hod: "Dr. Sunita Rao", faculty: 15, students: 360, estd: 1997, pg: "M.Tech VLSI", category: "Academic" },
  { id: "ME", name: "Mechanical Engineering", hod: "Dr. Vijay Patil", faculty: 20, students: 420, estd: 1992, pg: "M.Tech Thermal", category: "Academic" },
  { id: "EEE", name: "Electrical & Electronics Engg.", hod: "Dr. Pradeep Gupta", faculty: 14, students: 300, estd: 1998, pg: "M.Tech Power", category: "Academic" },
  { id: "IT", name: "Information Technology", hod: "Dr. Meena Iyer", faculty: 12, students: 240, estd: 2001, pg: "MCA", category: "Academic" },
  { id: "CE", name: "Civil Engineering", hod: "Dr. Anil Mishra", faculty: 16, students: 350, estd: 1992, pg: "M.Tech Structural", category: "Academic" },
  { id: "AI", name: "Artificial Intelligence & ML", hod: "Dr. Priya Venkatesh", faculty: 10, students: 180, estd: 2021, pg: "M.Tech AI", category: "Academic" },
  { id: "HUM", name: "Humanities", hod: "", faculty: 0, students: 0, estd: 1992, pg: "", category: "Academic" },
  { id: "ADM", name: "Administration", hod: "", faculty: 0, students: 0, estd: 1992, pg: "", category: "Administrative" },
  { id: "LIB", name: "Library", hod: "", faculty: 0, students: 0, estd: 1992, pg: "", category: "Administrative" },
];

const INIT_STUDENTS = [
  { id: "S001", name: "Arjun Mehta", dept: "CSE", year: 3, gender: "Male", dob: "2002-04-15", phone: "9876543210", email: "arjun.mehta@vidyasagar.ac.in", status: "Active", cgpa: 8.7, fee_status: "Paid", transport: "Route A", guardian: "Suresh Mehta", address: "12A MG Road, Bengaluru" },
  { id: "S002", name: "Priya Sharma", dept: "ECE", year: 2, gender: "Female", dob: "2003-07-22", phone: "9876543211", email: "priya.sharma@vidyasagar.ac.in", status: "Active", cgpa: 9.1, fee_status: "Paid", transport: "Route B", guardian: "Rajan Sharma", address: "45 Koramangala, Bengaluru" },
  { id: "S003", name: "Rahul Verma", dept: "ME", year: 4, gender: "Male", dob: "2001-01-10", phone: "9876543212", email: "rahul.verma@vidyasagar.ac.in", status: "Active", cgpa: 7.5, fee_status: "Pending", transport: "Own", guardian: "Anil Verma", address: "7 BTM Layout, Bengaluru" },
  { id: "S004", name: "Sneha Patel", dept: "CSE", year: 1, gender: "Female", dob: "2004-11-03", phone: "9876543213", email: "sneha.patel@vidyasagar.ac.in", status: "Active", cgpa: 8.2, fee_status: "Paid", transport: "Route A", guardian: "Kiran Patel", address: "23 Whitefield, Bengaluru" },
  { id: "S005", name: "Karan Singh", dept: "EEE", year: 3, gender: "Male", dob: "2002-06-18", phone: "9876543214", email: "karan.singh@vidyasagar.ac.in", status: "Active", cgpa: 6.9, fee_status: "Overdue", transport: "Route C", guardian: "Harjit Singh", address: "56 Marathahalli, Bengaluru" },
  { id: "S006", name: "Divya Nair", dept: "IT", year: 2, gender: "Female", dob: "2003-09-25", phone: "9876543215", email: "divya.nair@vidyasagar.ac.in", status: "Active", cgpa: 9.4, fee_status: "Paid", transport: "Route B", guardian: "Suresh Nair", address: "8 Electronic City, Bengaluru" },
  { id: "S007", name: "Amit Joshi", dept: "CE", year: 3, gender: "Male", dob: "2002-03-11", phone: "9876543216", email: "amit.joshi@vidyasagar.ac.in", status: "Active", cgpa: 7.8, fee_status: "Paid", transport: "Route D", guardian: "Mohan Joshi", address: "34 JP Nagar, Bengaluru" },
  { id: "S008", name: "Riya Menon", dept: "CSE", year: 4, gender: "Female", dob: "2001-12-05", phone: "9876543217", email: "riya.menon@vidyasagar.ac.in", status: "Active", cgpa: 8.9, fee_status: "Paid", transport: "Own", guardian: "Thomas Menon", address: "90 Indiranagar, Bengaluru" },
  { id: "S009", name: "Vikram Reddy", dept: "AI", year: 1, gender: "Male", dob: "2004-02-14", phone: "9876543218", email: "vikram.reddy@vidyasagar.ac.in", status: "Active", cgpa: 8.5, fee_status: "Paid", transport: "Route A", guardian: "Rajesh Reddy", address: "12 Banjara Hills, Hyderabad" },
  { id: "S010", name: "Ananya Krishnan", dept: "CSE", year: 2, gender: "Female", dob: "2003-05-30", phone: "9876543219", email: "ananya.k@vidyasagar.ac.in", status: "Active", cgpa: 9.2, fee_status: "Paid", transport: "Route B", guardian: "Mohan Krishnan", address: "67 Sadashivanagar, Bengaluru" },
];

const SEEDED_ATTENDANCE_IDS = new Set(INIT_STUDENTS.map(s => s.id));

const INIT_STUDENT_FEES = [
  { studentId: "S001", name: "Arjun Mehta", dept: "CSE", year: 3, tuition: 145000, hostel: 0, transport: 20000, lab: 9500, exam: 3000, library: 2500, sports: 1500, miscellaneous: 0, paid: 195500, balance: 0, status: "Paid", dueDate: "2025-07-31", lastPayment: "2025-04-10" },
  { studentId: "S002", name: "Priya Sharma", dept: "ECE", year: 2, tuition: 145000, hostel: 72000, transport: 20000, lab: 9500, exam: 3000, library: 2500, sports: 1500, miscellaneous: 0, paid: 269500, balance: 0, status: "Paid", dueDate: "2025-07-31", lastPayment: "2025-03-22" },
  { studentId: "S003", name: "Rahul Verma", dept: "ME", year: 4, tuition: 145000, hostel: 0, transport: 0, lab: 9500, exam: 3000, library: 2500, sports: 1500, miscellaneous: 0, paid: 120000, balance: 57500, status: "Pending", dueDate: "2025-07-31", lastPayment: "2025-01-15" },
  { studentId: "S004", name: "Sneha Patel", dept: "CSE", year: 1, tuition: 145000, hostel: 72000, transport: 20000, lab: 9500, exam: 3000, library: 2500, sports: 1500, miscellaneous: 0, paid: 279500, balance: 0, status: "Paid", dueDate: "2025-07-31", lastPayment: "2025-04-18" },
  { studentId: "S005", name: "Karan Singh", dept: "EEE", year: 3, tuition: 145000, hostel: 0, transport: 20000, lab: 9500, exam: 3000, library: 2500, sports: 1500, miscellaneous: 500, paid: 100000, balance: 100000, status: "Overdue", dueDate: "2025-06-30", lastPayment: "2024-12-10" },
  { studentId: "S006", name: "Divya Nair", dept: "IT", year: 2, tuition: 145000, hostel: 72000, transport: 20000, lab: 9500, exam: 3000, library: 2500, sports: 1500, miscellaneous: 0, paid: 269500, balance: 0, status: "Paid", dueDate: "2025-07-31", lastPayment: "2025-04-05" },
  { studentId: "S007", name: "Amit Joshi", dept: "CE", year: 3, tuition: 145000, hostel: 0, transport: 20000, lab: 9500, exam: 3000, library: 2500, sports: 1500, miscellaneous: 0, paid: 197500, balance: 0, status: "Paid", dueDate: "2025-07-31", lastPayment: "2025-03-30" },
  { studentId: "S008", name: "Riya Menon", dept: "CSE", year: 4, tuition: 145000, hostel: 0, transport: 0, lab: 9500, exam: 3000, library: 2500, sports: 1500, miscellaneous: 0, paid: 177500, balance: 0, status: "Paid", dueDate: "2025-07-31", lastPayment: "2025-04-20" },
  { studentId: "S009", name: "Vikram Reddy", dept: "AI", year: 1, tuition: 145000, hostel: 72000, transport: 20000, lab: 9500, exam: 3000, library: 2500, sports: 1500, miscellaneous: 0, paid: 279500, balance: 0, status: "Paid", dueDate: "2025-07-31", lastPayment: "2025-04-12" },
  { studentId: "S010", name: "Ananya Krishnan", dept: "CSE", year: 2, tuition: 145000, hostel: 72000, transport: 20000, lab: 9500, exam: 3000, library: 2500, sports: 1500, miscellaneous: 0, paid: 269500, balance: 0, status: "Paid", dueDate: "2025-07-31", lastPayment: "2025-04-08" },
];

// NOTE: publications counts are derived from PUBS — 1 per staff member except
// Dr. Sunita Rao who has 2 (P002 + P007). All others have exactly 1.
// Prof. Anita Das, Prof. Suresh Babu have 0 in PUBS (no entries listed for them).
const INIT_STAFF = [
  { id: "T001", name: "Dr. Ramesh Kumar", dept: "CSE", role: "Professor & HoD", type: "Teaching", qual: "Ph.D.", exp: 22, publications: 1, status: "Active", email: "ramesh.kumar@vidyasagar.ac.in", phone: "9811000001" },
  { id: "T002", name: "Prof. Anita Das", dept: "CSE", role: "Associate Professor", type: "Teaching", qual: "M.Tech", exp: 14, publications: 0, status: "Active", email: "anita.das@vidyasagar.ac.in", phone: "9811000002" },
  { id: "T003", name: "Dr. Sunita Rao", dept: "ECE", role: "Professor & HoD", type: "Teaching", qual: "Ph.D.", exp: 19, publications: 2, status: "Active", email: "sunita.rao@vidyasagar.ac.in", phone: "9811000003" },
  { id: "T004", name: "Dr. Vijay Patil", dept: "ME", role: "Professor & HoD", type: "Teaching", qual: "Ph.D.", exp: 17, publications: 1, status: "Active", email: "vijay.patil@vidyasagar.ac.in", phone: "9811000004" },
  { id: "T005", name: "Dr. Meena Iyer", dept: "IT", role: "Professor & HoD", type: "Teaching", qual: "Ph.D.", exp: 15, publications: 1, status: "Active", email: "meena.iyer@vidyasagar.ac.in", phone: "9811000005" },
  { id: "T006", name: "Prof. Kiran Nair", dept: "EEE", role: "Assistant Professor", type: "Teaching", qual: "M.Tech", exp: 8, publications: 1, status: "Active", email: "kiran.nair@vidyasagar.ac.in", phone: "9811000006" },
  { id: "T007", name: "Dr. Priya Venkatesh", dept: "AI", role: "Professor & HoD", type: "Teaching", qual: "Ph.D.", exp: 10, publications: 1, status: "Active", email: "priya.v@vidyasagar.ac.in", phone: "9811000007" },
  { id: "T008", name: "Prof. Suresh Babu", dept: "CE", role: "Associate Professor", type: "Teaching", qual: "M.Tech", exp: 11, publications: 0, status: "Active", email: "suresh.babu@vidyasagar.ac.in", phone: "9811000008" },
  { id: "S001", name: "Rajesh Nair", dept: "ADM", role: "Registrar", type: "Support", qual: "MBA", exp: 12, publications: 0, status: "Active", email: "registrar@vidyasagar.ac.in", phone: "9811000009" },
  { id: "S002", name: "Kavitha M.", dept: "LIB", role: "Chief Librarian", type: "Support", qual: "MLIS", exp: 9, publications: 0, status: "Active", email: "library@vidyasagar.ac.in", phone: "9811000010" },
];

const INIT_COURSES = [
  { code: "CS601", name: "Machine Learning", dept: "CSE", credits: 4, type: "Core", faculty: "Dr. Ramesh Kumar", sem: 6, students: 120, syllabus: "Supervised & unsupervised learning, Neural networks, Deep learning, CNNs, RNNs, Transformers" },
  { code: "CS502", name: "Database Systems", dept: "CSE", credits: 3, type: "Core", faculty: "Prof. Anita Das", sem: 5, students: 115, syllabus: "SQL, NoSQL, ACID, Normalization, Query optimization, Transactions" },
  { code: "EC401", name: "VLSI Design", dept: "ECE", credits: 4, type: "Core", faculty: "Dr. Sunita Rao", sem: 7, students: 88, syllabus: "CMOS design, Layout, RTL synthesis, Timing analysis" },
  { code: "ME301", name: "Fluid Mechanics", dept: "ME", credits: 3, type: "Core", faculty: "Dr. Vijay Patil", sem: 3, students: 98, syllabus: "Bernoulli, Reynolds, Pipe flow, Turbomachinery" },
  { code: "CS701", name: "Cloud Computing", dept: "CSE", credits: 3, type: "Elective", faculty: "Prof. Anita Das", sem: 7, students: 75, syllabus: "AWS, Azure, GCP, Microservices, Docker, Kubernetes" },
  { code: "AI501", name: "Deep Learning", dept: "AI", credits: 4, type: "Core", faculty: "Dr. Priya Venkatesh", sem: 5, students: 60, syllabus: "CNNs, RNNs, GANs, Transformers, LLMs, Fine-tuning" },
  { code: "IT401", name: "Web Technologies", dept: "IT", credits: 3, type: "Core", faculty: "Dr. Meena Iyer", sem: 4, students: 62, syllabus: "HTML5, CSS3, React, Node.js, REST APIs, GraphQL" },
  { code: "EE501", name: "Power Systems", dept: "EEE", credits: 4, type: "Core", faculty: "Prof. Kiran Nair", sem: 5, students: 78, syllabus: "Load flow, Fault analysis, Power electronics, Grid stability" },
  { code: "CE401", name: "Structural Engineering", dept: "CE", credits: 4, type: "Core", faculty: "Prof. Suresh Babu", sem: 4, students: 82, syllabus: "RCC design, Steel structures, Prestressed concrete, Limit state" },
  { code: "HS101", name: "Engineering Ethics", dept: "HUM", credits: 2, type: "Mandatory", faculty: "Dr. Priya Mohan", sem: 1, students: 480, syllabus: "Professional responsibility, IPR, Environment ethics" },
];

const INIT_EXAMS = [
  { id: "E001", name: "End Semester — Nov 2024", dept: "All", type: "Semester", date: "2024-11-18", status: "Completed", total: 2150, hall_tickets: true },
  { id: "E002", name: "Mid Semester — Sept 2024", dept: "All", type: "Mid Term", date: "2024-09-10", status: "Completed", total: 2150, hall_tickets: true },
  { id: "E003", name: "Supplementary — Jan 2025", dept: "All", type: "Supplementary", date: "2025-01-15", status: "Completed", total: 148, hall_tickets: true },
  { id: "E004", name: "Internal Assessment — Apr 2025", dept: "CSE", type: "Internal", date: "2025-04-10", status: "Completed", total: 480, hall_tickets: true },
  { id: "E005", name: "End Semester — May 2025", dept: "All", type: "Semester", date: "2025-05-12", status: "Upcoming", total: 2150, hall_tickets: false },
  { id: "E006", name: "Practical Exam — Jun 2025", dept: "CSE", type: "Practical", date: "2025-06-05", status: "Scheduled", total: 480, hall_tickets: false },
  { id: "E007", name: "Mid Semester — Sept 2025", dept: "All", type: "Mid Term", date: "2025-09-08", status: "Scheduled", total: 2150, hall_tickets: false },
];

const INIT_FEES = [
  { id: "F001", type: "Tuition Fee", amount: 145000, freq: "Annual", due_date: "2025-07-31", collected: 135550, pending: 9450 },
  { id: "F002", type: "Hostel Fee", amount: 72000, freq: "Annual", due_date: "2025-07-31", collected: 64800, pending: 7200 },
  { id: "F003", type: "Transport Fee", amount: 20000, freq: "Annual", due_date: "2025-07-31", collected: 18400, pending: 1600 },
  { id: "F004", type: "Lab Fee", amount: 9500, freq: "Semester", due_date: "2025-08-15", collected: 9025, pending: 475 },
  { id: "F005", type: "Exam Fee", amount: 3000, freq: "Semester", due_date: "2025-10-01", collected: 2880, pending: 120 },
  { id: "F006", type: "Library Fee", amount: 2500, freq: "Annual", due_date: "2025-07-31", collected: 2375, pending: 125 },
  { id: "F007", type: "Sports Fee", amount: 1500, freq: "Annual", due_date: "2025-07-31", collected: 1425, pending: 75 },
  { id: "F008", type: "Development Fee", amount: 5000, freq: "Annual", due_date: "2025-07-31", collected: 4750, pending: 250 },
  { id: "F009", type: "Admission Fee", amount: 10000, freq: "One-time", due_date: "2025-07-31", collected: 9000, pending: 1000 },
  { id: "F010", type: "Alumni Fee", amount: 2000, freq: "One-time", due_date: "2025-07-31", collected: 1900, pending: 100 },
  { id: "F011", type: "Medical Fee", amount: 1000, freq: "Annual", due_date: "2025-07-31", collected: 950, pending: 50 },
  { id: "F012", type: "Placement Fee", amount: 5000, freq: "One-time", due_date: "2025-12-31", collected: 4750, pending: 250 },
  { id: "F013", type: "IT Infrastructure Fee", amount: 3000, freq: "Annual", due_date: "2025-07-31", collected: 2850, pending: 150 },
  { id: "F014", type: "Miscellaneous Fee", amount: 500, freq: "Annual", due_date: "2025-07-31", collected: 475, pending: 25 },
];

const FEE_COMPONENTS = [
  { key: "tuition", studentKey: "tuition", type: "Tuition Fee", label: "Tuition", defaultAmount: 145000 },
  { key: "hostel", studentKey: "hostel", type: "Hostel Fee", label: "Hostel", defaultAmount: 72000 },
  { key: "transport", studentKey: "transport_fee", type: "Transport Fee", label: "Transport", defaultAmount: 20000 },
  { key: "lab", studentKey: "lab", type: "Lab Fee", label: "Lab", defaultAmount: 9500 },
  { key: "exam", studentKey: "exam", type: "Exam Fee", label: "Exam", defaultAmount: 3000 },
  { key: "library", studentKey: "library", type: "Library Fee", label: "Library", defaultAmount: 2500 },
  { key: "sports", studentKey: "sports", type: "Sports Fee", label: "Sports", defaultAmount: 1500 },
  { key: "development", studentKey: "development", type: "Development Fee", label: "Development", defaultAmount: 5000 },
  { key: "admission", studentKey: "admission", type: "Admission Fee", label: "Admission", defaultAmount: 10000 },
  { key: "alumniFee", studentKey: "alumni_fee", type: "Alumni Fee", label: "Alumni", defaultAmount: 2000 },
  { key: "medical", studentKey: "medical", type: "Medical Fee", label: "Medical", defaultAmount: 1000 },
  { key: "placement", studentKey: "placement", type: "Placement Fee", label: "Placement", defaultAmount: 5000 },
  { key: "itInfra", studentKey: "it_infra", type: "IT Infrastructure Fee", label: "IT Infra", defaultAmount: 3000 },
  { key: "miscellaneous", studentKey: "miscellaneous", type: "Miscellaneous Fee", label: "Misc", defaultAmount: 500 },
];

const feeNumber = (value) => Number(value) || 0;
const positiveFeeTotal = (record) =>
  FEE_COMPONENTS.reduce((sum, { key }) => {
    const value = feeNumber(record?.[key]);
    return value > 0 ? sum + value : sum;
  }, 0);
const feeFormDefaults = () => Object.fromEntries(FEE_COMPONENTS.map(({ key }) => [key, "0"]));
const feeFieldsFromStandards = (standards = {}) =>
  Object.fromEntries(FEE_COMPONENTS.map(({ key }) => [key, feeNumber(standards[key])]));
const feeFieldsFromStudent = (student = {}) =>
  Object.fromEntries(FEE_COMPONENTS.map(({ key, studentKey }) => [key, feeNumber(student[studentKey] ?? student[key])]));
const feeFormFieldsFromStudent = (student = {}) =>
  Object.fromEntries(FEE_COMPONENTS.map(({ key, studentKey }) => [key, String(feeNumber(student[studentKey] ?? student[key]))]));
const feeStandardTotal = (standards = {}) => positiveFeeTotal(feeFieldsFromStandards(standards));
const feePayloadFields = (values) => ({
  tuition: values.tuition,
  hostel: values.hostel,
  transport_fee: values.transport,
  lab: values.lab,
  exam: values.exam,
  library: values.library,
  sports: values.sports,
  development: values.development,
  admission: values.admission,
  alumni_fee: values.alumniFee,
  medical: values.medical,
  placement: values.placement,
  it_infra: values.itInfra,
  miscellaneous: values.miscellaneous,
});
const FEE_COMPONENT_BY_TYPE = Object.fromEntries(FEE_COMPONENTS.map(component => [component.type, component]));
const LEGACY_FEE_STANDARDS_KEY = "erp_fee_standards";
const LEGACY_STUDENT_FEE_COLLECTIONS_KEY = "erp_student_fee_collections";
const DEFAULT_FEE_STANDARDS = Object.fromEntries(FEE_COMPONENTS.map(({ key, defaultAmount }) => [key, defaultAmount]));
const feeStandardsFromFees = (feeRows = []) => {
  const standards = { ...DEFAULT_FEE_STANDARDS };
  feeRows.forEach((row) => {
    const component = FEE_COMPONENT_BY_TYPE[row.type];
    if (component) standards[component.key] = feeNumber(row.amount);
  });
  return standards;
};
const loadLegacyFeeStandards = () => {
  try {
    const raw = localStorage.getItem(LEGACY_FEE_STANDARDS_KEY);
    if (!raw) return null;
    return { ...DEFAULT_FEE_STANDARDS, ...JSON.parse(raw) };
  } catch {
    return null;
  }
};
const loadLegacyStudentFeeCollections = () => {
  try {
    const raw = localStorage.getItem(LEGACY_STUDENT_FEE_COLLECTIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};
const studentAssignedFeeHeads = (student = {}) =>
  Object.fromEntries(FEE_COMPONENTS.map(({ key, studentKey }) => [key, feeNumber(student[studentKey] ?? student[key]) > 0]));
const collectionFieldsFromStudent = (student = {}, savedCollections = {}) => {
  if (savedCollections && Object.keys(savedCollections).length) {
    return Object.fromEntries(
      FEE_COMPONENTS.map(({ key, studentKey }) => [
        key,
        String(Math.max(0, feeNumber(savedCollections[studentKey] ?? savedCollections[key]))),
      ]),
    );
  }
  let remaining = Math.max(0, feeNumber(student.fees_paid ?? student.paid));
  return Object.fromEntries(FEE_COMPONENTS.map(({ key, studentKey }) => {
    const demand = Math.max(0, feeNumber(student[studentKey] ?? student[key]));
    const collected = Math.min(demand, remaining);
    remaining = Math.max(0, remaining - collected);
    return [key, String(collected)];
  }));
};
const savedCollectionAmount = (savedCollections = {}, component = {}) =>
  feeNumber(savedCollections[component.studentKey] ?? savedCollections[component.key]);
const feeDemandTotal = (assignedHeads = {}, standards = {}) =>
  FEE_COMPONENTS.reduce((sum, { key }) => sum + (assignedHeads[key] ? feeNumber(standards[key]) : 0), 0);
const feeCollectionTotal = (collections = {}) =>
  FEE_COMPONENTS.reduce((sum, { key }) => sum + Math.max(0, feeNumber(collections[key])), 0);
const feeOutstandingTotal = (assignedHeads = {}, collections = {}, standards = {}) =>
  FEE_COMPONENTS.reduce((sum, { key }) => {
    if (!assignedHeads[key]) return sum;
    return sum + Math.max(0, feeNumber(standards[key]) - Math.max(0, feeNumber(collections[key])));
  }, 0);
const feeAdvanceTotal = (assignedHeads = {}, collections = {}, standards = {}) =>
  FEE_COMPONENTS.reduce((sum, { key }) => {
    if (!assignedHeads[key]) return sum;
    return sum + Math.max(0, Math.max(0, feeNumber(collections[key])) - feeNumber(standards[key]));
  }, 0);
const feeHeadLedgerRows = (assignedHeads = {}, collections = {}, standards = {}) =>
  FEE_COMPONENTS
    .filter(({ key }) => assignedHeads[key] || Math.max(0, feeNumber(collections[key])) > 0)
    .map(({ key, label }) => {
      const demand = assignedHeads[key] ? feeNumber(standards[key]) : 0;
      const collected = Math.max(0, feeNumber(collections[key]));
      return {
        key,
        label,
        demand,
        collected,
        outstanding: Math.max(0, demand - collected),
        advance: Math.max(0, collected - demand),
      };
    });

const INIT_ROUTES = [
  { id: "R001", name: "Route A", area: "Koramangala – Indiranagar", stops: 8, students: 45, driver: "Ravi Kumar", bus: "KA-01-AB-1234", time: "7:30 AM", contact: "9900001111" },
  { id: "R002", name: "Route B", area: "Whitefield – Marathahalli", stops: 6, students: 38, driver: "Suresh M.", bus: "KA-01-CD-5678", time: "7:45 AM", contact: "9900002222" },
  { id: "R003", name: "Route C", area: "Electronic City – BTM Layout", stops: 10, students: 62, driver: "Mahesh P.", bus: "KA-01-EF-9012", time: "7:15 AM", contact: "9900003333" },
  { id: "R004", name: "Route D", area: "Jayanagar – JP Nagar – Banashankari", stops: 7, students: 31, driver: "Ramesh N.", bus: "KA-01-GH-3456", time: "7:40 AM", contact: "9900004444" },
  { id: "R005", name: "Route E", area: "Hebbal – Yelahanka", stops: 9, students: 27, driver: "Arun K.", bus: "KA-01-IJ-7890", time: "7:20 AM", contact: "9900005555" },
];

const CERTS = [
  { id: "C001", type: "Degree Certificate", student: "Rahul Verma", date: "2025-05-20", status: "Issued", verif: "VER-2025-001" },
  { id: "C002", type: "Provisional Certificate", student: "Riya Menon", date: "2025-05-22", status: "Issued", verif: "VER-2025-002" },
  { id: "C003", type: "Bonafide Certificate", student: "Arjun Mehta", date: "2025-04-10", status: "Issued", verif: "VER-2025-003" },
  { id: "C004", type: "Transcript", student: "Priya Sharma", date: "2025-04-18", status: "Pending", verif: "—" },
  { id: "C005", type: "Character Certificate", student: "Divya Nair", date: "2025-03-15", status: "Issued", verif: "VER-2025-005" },
  { id: "C006", type: "Migration Certificate", student: "Karan Singh", date: "2025-02-28", status: "Issued", verif: "VER-2025-006" },
];

const PUBS = [
  { id: "P001", staff_id: "T001", title: "LLM-based Automated Code Review for Software Defect Detection", author: "Dr. Ramesh Kumar", journal: "IEEE Trans. Software Eng.", year: 2025, type: "Journal", impact: 4.8 },
  { id: "P002", staff_id: "T003", title: "Sub-6GHz Beamforming Antenna Arrays for 5G NR", author: "Dr. Sunita Rao", journal: "IEEE Antennas & Propagation", year: 2025, type: "Journal", impact: 4.1 },
  { id: "P003", staff_id: "T004", title: "Digital Twin Framework for Predictive Maintenance", author: "Dr. Vijay Patil", journal: "Int. J. Adv. Manufacturing", year: 2025, type: "Journal", impact: 4.5 },
  { id: "P004", staff_id: "T005", title: "Federated Learning for Privacy-preserving ERP Systems", author: "Dr. Meena Iyer", journal: "ACM SIGMOD 2025", year: 2025, type: "Conference", impact: "—" },
  { id: "P005", staff_id: "T007", title: "Attention Mechanisms for Multi-modal Sentiment Analysis", author: "Dr. Priya Venkatesh", journal: "Pattern Recognition Letters", year: 2025, type: "Journal", impact: 3.9 },
  { id: "P006", staff_id: "T006", title: "Smart Grid Energy Optimization using Reinforcement Learning", author: "Prof. Kiran Nair", journal: "Applied Energy", year: 2024, type: "Journal", impact: 3.2 },
  { id: "P007", staff_id: "T003", title: "High-Performance RISC-V Processor Implementation on FPGA", author: "Dr. Sunita Rao", journal: "VLSI Design 2024", year: 2024, type: "Conference", impact: "—" },
];

const AICTE_INIT = [
  { id: "ac1", cat: "Infrastructure", item: "Carpet area per student ≥ 1.5 sq.m", status: "ok", note: "Current: 2.3 sq.m" },
  { id: "ac2", cat: "Infrastructure", item: "Computer lab ratio 1:2 (student:system)", status: "ok", note: "Ratio: 1:1.8" },
  { id: "ac3", cat: "Infrastructure", item: "Library with ≥ 2000 titles/dept", status: "ok", note: "16,400 titles total" },
  { id: "ac4", cat: "Faculty", item: "Faculty:Student ratio ≤ 1:15", status: "warn", note: "Current 1:17 — action needed" },
  { id: "ac5", cat: "Faculty", item: "≥ 60% Ph.D. qualified faculty", status: "ok", note: "68% Ph.D." },
  { id: "ac6", cat: "Faculty", item: "Faculty vacancies ≤ 10%", status: "ok", note: "3% vacant" },
  { id: "ac7", cat: "Finances", item: "Endowment fund ≥ ₹5 Cr", status: "ok", note: "₹9.8 Cr" },
  { id: "ac8", cat: "Finances", item: "Fee refund policy displayed", status: "ok", note: "Published on website" },
  { id: "ac9", cat: "Academics", item: "Outcome Based Education (OBE) implemented", status: "ok", note: "All programs" },
  { id: "ac10", cat: "Academics", item: "NAAC/NBA accreditation current", status: "warn", note: "NAAC A+ renewal due Dec 2025" },
  { id: "ac11", cat: "Academics", item: "Scopus/SCI publications ≥ 50/year", status: "ok", note: "74 papers (2024–25)" },
  { id: "ac12", cat: "Compliance", item: "Anti-ragging committee active", status: "ok", note: "Reconstituted Jun 2025" },
  { id: "ac13", cat: "Compliance", item: "Grievance redressal cell functional", status: "ok", note: "Online portal active" },
  { id: "ac14", cat: "Compliance", item: "IQAC active", status: "ok", note: "Minutes updated quarterly" },
  { id: "ac15", cat: "Compliance", item: "Annual reports submitted to AICTE portal", status: "warn", note: "2024-25 due by Aug 31" },
];

const INIT_BATCHES = [
  { year: "2021", batches: [{ id: "CSE-21A", dept: "CSE", students: 120, mentor: "Dr. Ramesh Kumar" }, { id: "ECE-21A", dept: "ECE", students: 95, mentor: "Dr. Sunita Rao" }, { id: "ME-21A", dept: "ME", students: 80, mentor: "Dr. Vijay Patil" }] },
  { year: "2022", batches: [{ id: "CSE-22A", dept: "CSE", students: 130, mentor: "Prof. Anita Das" }, { id: "EEE-22A", dept: "EEE", students: 85, mentor: "Dr. Pradeep Gupta" }, { id: "IT-22A", dept: "IT", students: 70, mentor: "Dr. Meena Iyer" }] },
  { year: "2023", batches: [{ id: "CSE-23A", dept: "CSE", students: 140, mentor: "Dr. Ramesh Kumar" }, { id: "ECE-23A", dept: "ECE", students: 100, mentor: "Dr. Sunita Rao" }, { id: "CE-23A", dept: "CE", students: 75, mentor: "Dr. Anil Mishra" }] },
  { year: "2024", batches: [{ id: "CSE-24A", dept: "CSE", students: 150, mentor: "Prof. Anita Das" }, { id: "IT-24A", dept: "IT", students: 80, mentor: "Dr. Meena Iyer" }, { id: "AI-24A", dept: "AI", students: 60, mentor: "Dr. Priya Venkatesh" }] },
  { year: "2025", batches: [{ id: "CSE-25A", dept: "CSE", students: 160, mentor: "Dr. Ramesh Kumar" }, { id: "ECE-25A", dept: "ECE", students: 110, mentor: "Dr. Sunita Rao" }, { id: "ME-25A", dept: "ME", students: 85, mentor: "Dr. Vijay Patil" }, { id: "AI-25A", dept: "AI", students: 70, mentor: "Dr. Priya Venkatesh" }] },
];

const FEE_TYPE_OPTIONS = ["Tuition Fee", "Hostel Fee", "Transport Fee", "Lab Fee", "Exam Fee", "Library Fee", "Sports Fee", "Development Fee", "Admission Fee", "Alumni Fee", "Medical Fee", "Placement Fee", "IT Infrastructure Fee", "Miscellaneous Fee"];

const DEPT_SUBJECTS = {
  CSE: ["Data Structures", "Algorithms", "DBMS", "Machine Learning", "Operating Systems", "Computer Networks", "Software Engineering", "Web Technologies"],
  ECE: ["Analog Circuits", "Digital Electronics", "VLSI Design", "Signal Processing", "Microprocessors", "Electromagnetics", "Communication Systems"],
  ME: ["Engineering Drawing", "Fluid Mechanics", "Thermodynamics", "Manufacturing Processes", "Strength of Materials", "Machine Design"],
  EEE: ["Circuit Theory", "Power Systems", "Control Systems", "Electrical Machines", "Power Electronics", "Drives"],
  IT: ["Data Structures", "Web Technologies", "Cloud Computing", "Networking", "Cybersecurity", "AI & ML"],
  CE: ["Structural Analysis", "Fluid Mechanics", "Geotechnical Engg", "Construction Management", "Environmental Engg"],
  AI: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Reinforcement Learning", "Data Science"],
};

const ADMIN_DEPT_IDS = new Set(["ADM", "LIB", "REG", "HR", "FIN", "ACCT", "ACCOUNTS", "STORE", "HOSTEL", "TRANSPORT"]);

const normalizeDeptCategory = (dept = {}) => {
  const explicit = String(dept?.category || "").trim();
  if (explicit === "Academic" || explicit === "Administrative") return explicit;
  const deptId = String(typeof dept === "string" ? dept : dept?.id || "").trim().toUpperCase();
  return ADMIN_DEPT_IDS.has(deptId) ? "Administrative" : "Academic";
};

const resolveDeptRecords = (liveDepts, extras = []) => {
  const source = Array.isArray(liveDepts) && liveDepts.length ? liveDepts : DEPTS;
  const merged = [...source, ...extras.map((id) => ({ id }))];
  const seen = new Set();
  return merged.reduce((rows, dept) => {
    const rawId = typeof dept === "string" ? dept : dept?.id;
    const id = String(rawId || "").trim().toUpperCase();
    if (!id || seen.has(id)) return rows;
    seen.add(id);
    const record = typeof dept === "string" ? { id, name: id } : { ...dept, id };
    rows.push({ ...record, category: normalizeDeptCategory(record) });
    return rows;
  }, []);
};

const resolveDeptIds = (liveDepts, extras = [], category = null) =>
  resolveDeptRecords(liveDepts, extras)
    .filter((dept) => !category || dept.category === category)
    .map((dept) => dept.id);

const resolveDeptSubjects = (deptId, courses = []) => {
  const courseSubjects = (Array.isArray(courses) ? courses : [])
    .filter((course) => course?.dept === deptId && String(course?.name || "").trim())
    .sort((a, b) => {
      const semA = Number(a?.sem) || 0;
      const semB = Number(b?.sem) || 0;
      if (semA !== semB) return semA - semB;
      return String(a?.name || "").localeCompare(String(b?.name || ""));
    })
    .map((course) => String(course.name).trim());
  const fallbackSubjects = Array.isArray(DEPT_SUBJECTS[deptId]) ? DEPT_SUBJECTS[deptId] : [];
  const subjects = [...new Set([...courseSubjects, ...fallbackSubjects])];
  return subjects.length ? subjects : ["General"];
};

// ─── MONTH HELPERS ─────────────────────────────────────────────────────────
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatMonthLabel = (date) => `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;

const parseMonthLabel = (monthLabel) => {
  const [monthText = "", yearText = ""] = String(monthLabel).trim().split(/\s+/);
  const monthIndex = MONTH_LABELS.indexOf(monthText);
  const year = Number.parseInt(yearText, 10);
  if (monthIndex < 0 || Number.isNaN(year)) return null;
  return { monthIndex, year };
};

const getAllMonths = () => {
  const months = [];
  const start = new Date(2022, 0, 1);
  const now = new Date();
  // Only go up to the CURRENT month — future months must not be selectable
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  let cur = new Date(start);
  while (cur <= end) {
    months.push(formatMonthLabel(cur));
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  return months;
};

const ALL_MONTHS = getAllMonths();
const CURRENT_MONTH = formatMonthLabel(new Date());

const isSunday = (monthLabel, dayNum) => {
  const parsed = parseMonthLabel(monthLabel);
  if (!parsed) return false;
  return new Date(parsed.year, parsed.monthIndex, dayNum).getDay() === 0;
};

const getDaysInMonth = (monthLabel) => {
  const parsed = parseMonthLabel(monthLabel);
  if (!parsed) return 30;
  return new Date(parsed.year, parsed.monthIndex + 1, 0).getDate();
};

// True if this day in this month is strictly after today (date only, no time)
const isFutureDate = (monthLabel, dayNum) => {
  const parsed = parseMonthLabel(monthLabel);
  if (!parsed) return false;
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const cellDate = new Date(parsed.year, parsed.monthIndex, dayNum);
  return cellDate > todayOnly;
};

// ─── ROLE CONFIG ───────────────────────────────────────────────────────────
const PERMS = {
  Admin: { pages: ["dashboard", "students", "departments", "staff", "courses", "exams", "attendance", "fees", "transport", "certificates", "publications", "aicte", "reports", "alumni", "batches"], canEdit: true, canDelete: true, canAdd: true },
  HOD: { pages: ["dashboard", "students", "departments", "staff", "courses", "exams", "attendance", "publications", "reports"], canEdit: true, canDelete: false, canAdd: true },
  "Teaching Staff": { pages: ["dashboard", "students", "courses", "attendance", "exams", "publications"], canEdit: false, canDelete: false, canAdd: false },
  "Support Staff": { pages: ["dashboard", "students", "fees", "transport", "certificates"], canEdit: true, canDelete: false, canAdd: true },
  "Exam Controller": { pages: ["dashboard", "students", "exams", "attendance", "certificates", "reports"], canEdit: true, canDelete: false, canAdd: true },
};

const ROLE_INFO = {
  Admin: { color: "admin", desc: "Full system access", icon: "🔑" },
  HOD: { color: "hod", desc: "Academic modules", icon: "🎓" },
  "Teaching Staff": { color: "teach", desc: "View — courses & attendance", icon: "👨‍🏫" },
  "Support Staff": { color: "support", desc: "Operations", icon: "🛠️" },
  "Exam Controller": { color: "exam", desc: "Examination modules", icon: "📝" },
};

// ─── TOAST ─────────────────────────────────────────────────────────────────
let _toastSetter = null;
const useToastSetter = (setter) => { _toastSetter = setter; };
const toast = (msg, type = "ok") => {
  if (!_toastSetter) return;
  const id = Date.now();
  _toastSetter(p => [...p, { id, msg, type }]);
  setTimeout(() => _toastSetter(p => p.filter(t => t.id !== id)), 3500);
};

const ToastManager = () => {
  const [toasts, setToasts] = useState([]);
  useToastSetter(setToasts);
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.type === "ok" ? "✅" : t.type === "err" ? "❌" : "ℹ️"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
};

// ─── HELPERS ───────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, footer, width }) => (
  <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal" style={width ? { width } : undefined}>
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
    <p>Your current role does not have permission to access the <strong>{page}</strong> module.</p>
  </div>
);

const RoleBanner = ({ role, userName }) => {
  const info = ROLE_INFO[role];
  return (
    <div className={`role-banner ${info.color}`}>
      <span>{info.icon}</span>
      <span><strong>{userName}</strong> — {role} · {info.desc}</span>
    </div>
  );
};

const Stat = ({ label, value, color, icon, trend }) => {
  const stripes = { gold: "linear-gradient(90deg,#b45309,#d97706)", teal: "linear-gradient(90deg,#0e7490,#0891b2)", blue: "linear-gradient(90deg,#1d4ed8,#2563eb)", purple: "linear-gradient(90deg,#6d28d9,#7c3aed)", orange: "linear-gradient(90deg,#c2410c,#ea580c)", red: "linear-gradient(90deg,#b91c1c,#dc2626)", green: "linear-gradient(90deg,#15803d,#16a34a)" };
  return (
    <div className="stat">
      <div className="stat-stripe" style={{ background: stripes[color] || stripes.blue }} />
      <div className="stat-ico">{icon}</div>
      <div className="stat-val">{value}</div>
      <div className="stat-lbl">{label}</div>
      {trend && <div className="stat-trend">↗ {trend}</div>}
    </div>
  );
};

const FormField = ({ label, name, type = "text", value, onChange, opts, full, disabled = false, placeholder = "" }) => (
  <div className={`fgrp${full ? " fg-full" : ""}`}>
    <label>{label}</label>
    {type === "select"
      ? <select name={name} value={value !== undefined && value !== null ? String(value) : ""} onChange={onChange} disabled={disabled}>
        {(opts || []).map(o => { const v = o && o.v !== undefined ? String(o.v) : String(o); const l = o && o.l !== undefined ? o.l : String(o); return <option key={v} value={v}>{l}</option>; })}
      </select>
      : type === "textarea"
        ? <textarea name={name} value={value !== undefined && value !== null ? value : ""} onChange={onChange} disabled={disabled} placeholder={placeholder} />
        : <input type={type} name={name} value={value !== undefined && value !== null ? String(value) : ""} onChange={onChange} disabled={disabled} placeholder={placeholder} />
    }
  </div>
);

// ─── ALERTS MODAL ──────────────────────────────────────────────────────────
const alertVisuals = (type) => {
  if (type === "err") return { icon: "🚨", cls: "err", label: "Critical" };
  if (type === "ok") return { icon: "✅", cls: "ok", label: "Resolved" };
  if (type === "info") return { icon: "ℹ️", cls: "info", label: "Info" };
  return { icon: "⚠️", cls: "warn", label: "Warning" };
};

const emptyAlertForm = () => ({
  id: "",
  title: "",
  message: "",
  type: "warn",
  date: new Date().toISOString().slice(0, 10),
});

const formatAlertDate = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const AlertsModal = ({ onClose, alerts = [], setAlerts, canEdit = false }) => {
  const [mode, setMode] = useState("create");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyAlertForm());

  const sortedAlerts = [...alerts].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const criticalCount = alerts.filter((alert) => alert.type === "err").length;
  const warningCount = alerts.filter((alert) => alert.type === "warn").length;
  const resolvedCount = alerts.filter((alert) => alert.type === "ok").length;
  const activeVisual = alertVisuals(form.type);

  const resetComposer = () => {
    setMode("create");
    setForm(emptyAlertForm());
  };

  const openEdit = (alert) => {
    setMode("edit");
    setForm({
      id: alert.id,
      title: alert.title || "",
      message: alert.message || "",
      type: alert.type || "warn",
      date: alert.date || new Date().toISOString().slice(0, 10),
    });
  };

  const saveAlert = async () => {
    if (!form.title.trim()) { toast("Alert title is required", "err"); return; }
    if (!form.message.trim()) { toast("Alert message is required", "err"); return; }
    setSaving(true);
    try {
      const payload = {
        id: form.id,
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type || "warn",
        date: form.date || new Date().toISOString().slice(0, 10),
      };
      if (mode === "edit" && form.id) {
        await alertsApi.update(form.id, payload);
        setAlerts((prev) => prev.map((alert) => (
          alert.id === form.id
            ? { ...alert, ...payload }
            : alert
        )));
        toast("Alert updated", "ok");
      } else {
        const res = await alertsApi.create(payload);
        const createdAlert = { ...payload, id: res?.id || payload.id || `ALR-${Date.now()}` };
        setAlerts((prev) => [createdAlert, ...prev]);
        toast("Alert added", "ok");
      }
      resetComposer();
    } catch (err) {
      toast(err.message || `Failed to ${mode === "edit" ? "update" : "add"} alert`, "err");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="🔔 Alert Center" onClose={onClose} footer={<button className="btn btn-secondary" onClick={onClose}>Close</button>} width={980}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
          {[
            { label: "Total Alerts", value: alerts.length, color: "var(--blue)", bg: "var(--blue-dim)", icon: "🔔" },
            { label: "Critical", value: criticalCount, color: "var(--red)", bg: "var(--red-dim)", icon: "🚨" },
            { label: "Warnings", value: warningCount, color: "var(--gold)", bg: "var(--gold-glow)", icon: "⚠️" },
            { label: "Resolved", value: resolvedCount, color: "var(--green)", bg: "var(--green-dim)", icon: "✅" },
          ].map((item) => (
            <div key={item.label} style={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "14px 16px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.6px" }}>{item.label}</span>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{item.icon}</span>
              </div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: canEdit ? "minmax(0, 300px) minmax(0, 1fr)" : "1fr", gap: 14, alignItems: "start" }}>
          {canEdit && (
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-head">
                <div>
                  <div className="card-title">{mode === "edit" ? "✏️ Edit Alert" : "➕ New Alert"}</div>
                  <div className="card-sub">{mode === "edit" ? "Update the selected alert" : "Create a new alert for the dashboard"}</div>
                </div>
                <span className={`badge b-${activeVisual.cls === "err" ? "red" : activeVisual.cls === "ok" ? "green" : activeVisual.cls === "info" ? "blue" : "gold"}`}>{activeVisual.label}</span>
              </div>
              <div className="card-body">
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: "var(--radius-sm)", background: activeVisual.cls === "err" ? "var(--red-dim)" : activeVisual.cls === "ok" ? "var(--green-dim)" : activeVisual.cls === "info" ? "var(--blue-dim)" : "var(--gold-glow)", border: `1px solid ${activeVisual.cls === "err" ? "rgba(220,38,38,0.15)" : activeVisual.cls === "ok" ? "rgba(22,163,74,0.15)" : activeVisual.cls === "info" ? "rgba(37,99,235,0.15)" : "rgba(217,119,6,0.15)"}`, marginBottom: 14 }}>
                  <span style={{ fontSize: 18 }}>{activeVisual.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text1)" }}>{form.title.trim() || "Alert preview"}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>{formatAlertDate(form.date)}</div>
                  </div>
                </div>
                <div className="fg">
                  <FormField label="Title" name="title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Short alert title" full />
                  <FormField label="Severity" name="type" type="select" value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))} opts={[{ v: "warn", l: "Warning" }, { v: "err", l: "Critical" }, { v: "info", l: "Info" }, { v: "ok", l: "Resolved" }]} />
                  <FormField label="Date" name="date" type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
                  <FormField label="Message" name="message" type="textarea" value={form.message} onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))} placeholder="Explain the issue, action, or status update" full />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14 }}>
                  <button className="btn btn-secondary btn-sm" onClick={resetComposer}>{mode === "edit" ? "Cancel Edit" : "Clear Form"}</button>
                  <button className="btn btn-primary btn-sm" onClick={saveAlert} disabled={saving}>{saving ? "Saving..." : mode === "edit" ? "Save Changes" : "Add Alert"}</button>
                </div>
              </div>
            </div>
          )}

          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-head">
              <div>
                <div className="card-title">📋 Live Alerts</div>
                <div className="card-sub">Persisted in the backend and visible from the top bar</div>
              </div>
              {canEdit && mode === "edit" && <button className="btn btn-secondary btn-sm" onClick={resetComposer}>+ New Alert</button>}
            </div>
            <div className="card-body" style={{ padding: 14 }}>
              {!sortedAlerts.length && (
                <div className="notif notif-info" style={{ marginBottom: 0 }}>
                  <span className="notif-ico">ℹ️</span>
                  <span>No alerts available.</span>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sortedAlerts.map((a) => {
                  const visuals = alertVisuals(a.type);
                  const borderColor = visuals.cls === "err"
                    ? "rgba(220,38,38,0.18)"
                    : visuals.cls === "ok"
                      ? "rgba(22,163,74,0.18)"
                      : visuals.cls === "info"
                        ? "rgba(37,99,235,0.18)"
                        : "rgba(217,119,6,0.18)";
                  const accentBg = visuals.cls === "err"
                    ? "var(--red-dim)"
                    : visuals.cls === "ok"
                      ? "var(--green-dim)"
                      : visuals.cls === "info"
                        ? "var(--blue-dim)"
                        : "var(--gold-glow)";
                  return (
                    <div key={a.id} style={{ display: "grid", gridTemplateColumns: "40px minmax(0, 1fr)", gap: 12, alignItems: "start", padding: "14px 16px", border: `1px solid ${borderColor}`, borderRadius: "var(--radius-sm)", background: "var(--bg1)", boxShadow: "var(--shadow-sm)" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                        {visuals.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text1)", marginBottom: 4 }}>{a.title}</div>
                            <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>{a.message}</div>
                          </div>
                          {canEdit && (
                            <button className="act act-edit" onClick={() => openEdit(a)}>Edit</button>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
                          <span className={`badge b-${visuals.cls === "err" ? "red" : visuals.cls === "ok" ? "green" : visuals.cls === "info" ? "blue" : "gold"}`}>{visuals.label}</span>
                          <span className="badge b-gray" style={{ fontFamily: "var(--font-mono)" }}>{a.id}</span>
                          <span style={{ fontSize: 11, color: "var(--text3)" }}>{formatAlertDate(a.date)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ─── GLOBAL SEARCH ─────────────────────────────────────────────────────────
const GlobalSearch = ({ students, staff, courses, setPage }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = (q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    const lq = q.toLowerCase();
    const res = [];
    students?.forEach(s => { if (s.name?.toLowerCase().includes(lq) || s.id?.toLowerCase().includes(lq)) res.push({ type: "Student", icon: "🎓", label: s.name, sub: `${s.dept} · Year ${s.year}`, page: "students" }); });
    staff?.forEach(s => { if (s.name?.toLowerCase().includes(lq) || s.role?.toLowerCase().includes(lq)) res.push({ type: "Staff", icon: "👨‍🏫", label: s.name, sub: `${s.dept} · ${s.role}`, page: "staff" }); });
    courses?.forEach(c => { if (c.name?.toLowerCase().includes(lq) || c.code?.toLowerCase().includes(lq)) res.push({ type: "Course", icon: "📖", label: c.name, sub: `${c.code} · ${c.dept}`, page: "courses" }); });
    setResults(res.slice(0, 10));
    setOpen(true);
  };

  return (
    <div className="tb-search" ref={ref}>
      <span style={{ color: "var(--text4)", fontSize: 13 }}>🔍</span>
      <input placeholder="Search students, staff, courses…" value={query} onChange={e => search(e.target.value)} onFocus={() => query && setOpen(true)} />
      {open && results.length > 0 && (
        <div className="search-results">
          {results.map((r, i) => (
            <div key={i} className="search-result-item" onClick={() => { setPage(r.page); setQuery(""); setOpen(false); }}>
              <span>{r.icon}</span>
              <div><div style={{ fontWeight: 600, fontSize: 12 }}>{r.label}</div><div style={{ fontSize: 10, color: "var(--text3)" }}>{r.type} · {r.sub}</div></div>
            </div>
          ))}
        </div>
      )}
      {open && query && !results.length && (
        <div className="search-results"><div className="search-result-item" style={{ color: "var(--text3)", cursor: "default" }}><span>🔍</span> No results for "{query}"</div></div>
      )}
    </div>
  );
};

// ─── EXPORT MODAL ──────────────────────────────────────────────────────────
const ExportModal = ({ onClose, students, staff, courses }) => {
  const exportCSV = (data, filename) => {
    if (!data?.length) { toast("No data to export", "err"); return; }
    const keys = Object.keys(data[0]);
    const csv = [keys.join(","), ...data.map(r => keys.map(k => `"${r[k] ?? ""}"`).join(","))].join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = filename; a.click();
    toast(`Exported ${filename}`, "ok"); onClose();
  };
  return (
    <Modal title="📤 Export Data" onClose={onClose} footer={<button className="btn btn-secondary" onClick={onClose}>Close</button>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[{ label: "Students Data", icon: "🎓", data: students, filename: "students_export.csv" }, { label: "Staff Records", icon: "👨‍🏫", data: staff, filename: "staff_export.csv" }, { label: "Courses List", icon: "📖", data: courses, filename: "courses_export.csv" }].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--bg2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <div><div style={{ fontWeight: 700, fontSize: 13 }}>{item.label}</div><div style={{ fontSize: 11, color: "var(--text3)" }}>{item.data?.length || 0} records</div></div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => exportCSV(item.data, item.filename)}>Export CSV</button>
          </div>
        ))}
      </div>
    </Modal>
  );
};

// ─── IMPORT MODAL ──────────────────────────────────────────────────────────
// ─── IMPORT FIELD MAPS ────────────────────────────────────────────────────────
const normalizeImportKey = (value = "") =>
  String(value)
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const normalizeImportText = (value = "") => String(value ?? "").trim();
const parseImportInt = (value, fallback = 0) => {
  const cleaned = normalizeImportText(value).replace(/,/g, "");
  const parsed = parseInt(cleaned, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const parseImportFloat = (value, fallback = 0) => {
  const cleaned = normalizeImportText(value).replace(/,/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const parseImportBool = (value, fallback = false) => {
  const raw = normalizeImportText(value).toLowerCase();
  if (["true", "1", "yes", "y", "issued", "done"].includes(raw)) return true;
  if (["false", "0", "no", "n", "pending", "notissued"].includes(raw)) return false;
  return fallback;
};
const normalizeIsoDate = (value) => {
  const raw = normalizeImportText(value);
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const dmy = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    let year = Number(dmy[3]);
    if (year < 100) year += 2000;
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return raw;
};
const normalizeStaffType = (value) => {
  const raw = normalizeImportText(value).toLowerCase();
  if (!raw) return "Teaching";
  if (raw.includes("support") || raw.includes("nonteach") || raw.includes("admin")) return "Support";
  return "Teaching";
};
const normalizeExamType = (value) => {
  const raw = normalizeImportText(value).toLowerCase();
  if (raw.includes("practical") || raw.includes("lab")) return "Practical";
  if (raw.includes("semester") || raw.includes("end")) return "Semester";
  return "Internal";
};
const normalizeRecordStatus = (value, fallback = "Active") => {
  const raw = normalizeImportText(value).toLowerCase();
  if (!raw) return fallback;
  if (raw.includes("inactive") || raw.includes("left")) return "Inactive";
  if (raw.includes("leave")) return "On Leave";
  if (raw.includes("ongoing")) return "Ongoing";
  if (raw.includes("complete")) return "Completed";
  if (raw.includes("scheduled") || raw.includes("upcoming")) return "Scheduled";
  return fallback;
};
const normalizeFeeStatus = (value) => {
  const raw = normalizeImportText(value).toLowerCase();
  if (raw.includes("paid")) return "Paid";
  if (raw.includes("over")) return "Overdue";
  return "Pending";
};
const normalizeGender = (value) => {
  const raw = normalizeImportText(value).toLowerCase();
  if (raw.startsWith("f")) return "Female";
  if (raw.startsWith("o")) return "Other";
  return "Male";
};
const normalizeImportRow = (row = {}) => {
  const normalized = {};
  Object.entries(row).forEach(([key, value]) => {
    const normalizedKey = normalizeImportKey(key);
    if (!normalizedKey) return;
    normalized[normalizedKey] = typeof value === "string" ? value.trim() : value;
  });
  return normalized;
};
const IMPORT_BASE_ALIASES = {
  id: ["id", "studentid", "staffid", "employeeid", "examid", "rollno", "rollnumber", "admissionno", "admissionnumber", "registrationno"],
  name: ["name", "studentname", "fullname", "student", "staffname", "facultyname", "examname", "title"],
  dept: ["dept", "department", "branch", "programme", "program", "departmentid", "departmentname"],
  year: ["year", "currentyear", "studyyear", "academicyear"],
  batch: ["batch", "admissionyear", "joiningyear", "batchyear"],
  gender: ["gender", "sex"],
  dob: ["dob", "dateofbirth", "birthdate"],
  phone: ["phone", "mobileno", "mobile", "contact", "phonenumber", "contactno"],
  email: ["email", "mail", "emailid"],
  status: ["status", "state"],
  role: ["role", "designation", "post"],
  type: ["type", "category", "stafftype", "examtype"],
  qual: ["qual", "qualification", "degree"],
  exp: ["exp", "experience", "experienceyears"],
  publications: ["publications", "publicationcount", "papers", "papercount"],
  code: ["code", "coursecode", "subjectcode"],
  credits: ["credits", "credit"],
  faculty: ["faculty", "facultyname", "teacher", "staffname"],
  sem: ["sem", "semester"],
  syllabus: ["syllabus", "description"],
  date: ["date", "examdate", "scheduleddate"],
  total: ["total", "students", "studentcount", "strength", "totalstudents"],
  hall_tickets: ["halltickets", "hallticket", "hallticketsissued", "hallticketissued", "ticketsissued"],
  fee_status: ["feestatus", "paymentstatus"],
  transport: ["transport", "transportmode", "route"],
  guardian: ["guardian", "guardianname", "parentname"],
  address: ["address", "studentaddress"],
  area: ["area", "routearea", "region"],
  stops: ["stops", "stopcount"],
  driver: ["driver", "drivername"],
  bus: ["bus", "busno", "vehicle", "vehicleno"],
  time: ["time", "departuretime"],
};
const IMPORT_ALIASES = {
  students: {
    fee_status: ["feestatus", "feepaymentstatus"],
  },
  staff: {
    type: ["type", "stafftype", "employmenttype"],
  },
  exams: {
    name: ["name", "examname", "title", "examtitle"],
    type: ["type", "examtype", "category"],
    date: ["date", "examdate", "scheduleddate"],
    hall_tickets: ["halltickets", "hallticket", "hallticketsissued", "hallticketstatus"],
  },
  fees: {
    paid: ["paid", "amountpaid", "collection", "collected", "totalpaid"],
    balance: ["balance", "due", "outstanding", "amountdue"],
    due_date: ["duedate", "paymentduedate", "lastdate"],
    miscellaneous: ["misc", "miscellaneous", "otherfees"],
    transport_fee: ["transport", "transportfee"],
    alumni_fee: ["alumni", "alumnifee"],
    it_infra: ["itinfra", "itinfrastructure", "itinfrastructurefee"],
  },
};
const getImportAliases = (field, aliases = {}) =>
  [...new Set([field, ...(IMPORT_BASE_ALIASES[field] || []), ...(aliases[field] || [])].map(normalizeImportKey).filter(Boolean))];
const hasImportField = (headers, field, aliases = {}) =>
  getImportAliases(field, aliases).some((alias) => headers.includes(alias));
const getImportField = (row, field, aliases = {}, fallback = "") => {
  for (const alias of getImportAliases(field, aliases)) {
    const value = row[alias];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return fallback;
};
const resolveImportedDept = (value, depts = []) => {
  const raw = normalizeImportText(value);
  if (!raw) return "CSE";
  const normalized = normalizeImportKey(raw);
  const match = (depts || []).find((dept) =>
    normalizeImportKey(dept.id) === normalized || normalizeImportKey(dept.name) === normalized
  );
  return match?.id || raw.toUpperCase();
};

// Each section defines: label, idField, required fields, mapper fn, api
const IMPORT_SECTIONS = {
  students: {
    label: "Students",
    icon: "🎓",
    idField: "id",
    requiredCols: ["name", "dept"],
    templateCols: "id,name,dept,year,gender,dob,phone,email,cgpa,fee_status,transport,guardian,address",
    templateNote: "IDs are optional and auto-generated | year=1–4 | gender=Male/Female/Other | fee_status=Paid/Pending/Overdue | transport=Own/Route A/Route B…",
    aliases: IMPORT_ALIASES.students,
    mapper: (row, i, { depts }) => ({
      id: "",  // always let backend auto-generate the sequential ID
      name: getImportField(row, "name", IMPORT_ALIASES.students),
      dept: resolveImportedDept(getImportField(row, "dept", IMPORT_ALIASES.students), depts),
      year: parseImportInt(getImportField(row, "year", IMPORT_ALIASES.students), 1),
      batch: parseImportInt(getImportField(row, "batch", IMPORT_ALIASES.students), new Date().getFullYear()),
      gender: normalizeGender(getImportField(row, "gender", IMPORT_ALIASES.students)),
      dob: normalizeIsoDate(getImportField(row, "dob", IMPORT_ALIASES.students)),
      phone: getImportField(row, "phone", IMPORT_ALIASES.students),
      email: getImportField(row, "email", IMPORT_ALIASES.students),
      status: normalizeRecordStatus(getImportField(row, "status", IMPORT_ALIASES.students), "Active"),
      cgpa: parseImportFloat(getImportField(row, "cgpa", IMPORT_ALIASES.students), 0),
      fee_status: normalizeFeeStatus(getImportField(row, "fee_status", IMPORT_ALIASES.students)),
      transport: getImportField(row, "transport", IMPORT_ALIASES.students, "Own") || "Own",
      guardian: getImportField(row, "guardian", IMPORT_ALIASES.students),
      address: getImportField(row, "address", IMPORT_ALIASES.students),
    }),
    persist: async (record) => {
      const res = await studentsApi.create(record);
      return res?.student || res;
    },
    setState: (setStudents, newOnes) => setStudents(prev => {
      const ids = new Set(prev.map(x => x.id));
      return [...prev, ...newOnes.filter(x => !ids.has(x.id))];
    }),
  },
  staff: {
    label: "Staff",
    icon: "👨‍🏫",
    idField: "id",
    requiredCols: ["name", "dept", "role", "type"],
    templateCols: "id,name,dept,role,type,qual,exp,publications,status,email,phone",
    templateNote: "IDs are optional and auto-generated | type=Teaching/Support | qual=Ph.D./M.Tech/MBA… | exp=years of experience",
    aliases: IMPORT_ALIASES.staff,
    mapper: (row, i, { depts }) => ({
      id: "",
      name: getImportField(row, "name", IMPORT_ALIASES.staff),
      dept: resolveImportedDept(getImportField(row, "dept", IMPORT_ALIASES.staff), depts),
      role: getImportField(row, "role", IMPORT_ALIASES.staff, "Assistant Professor") || "Assistant Professor",
      type: normalizeStaffType(getImportField(row, "type", IMPORT_ALIASES.staff)),
      qual: getImportField(row, "qual", IMPORT_ALIASES.staff),
      exp: parseImportInt(getImportField(row, "exp", IMPORT_ALIASES.staff), 0),
      publications: parseImportInt(getImportField(row, "publications", IMPORT_ALIASES.staff), 0),
      status: normalizeRecordStatus(getImportField(row, "status", IMPORT_ALIASES.staff), "Active"),
      email: getImportField(row, "email", IMPORT_ALIASES.staff),
      phone: getImportField(row, "phone", IMPORT_ALIASES.staff),
    }),
    persist: async (record) => {
      const res = await staffApi.create(record);
      return { ...record, id: res?.id || record.id };
    },
    setState: (setStaff, newOnes) => setStaff(prev => {
      const ids = new Set(prev.map(x => x.id));
      return [...prev, ...newOnes.filter(x => !ids.has(x.id))];
    }),
  },
  courses: {
    label: "Courses",
    icon: "📚",
    idField: "code",
    requiredCols: ["code", "name", "dept"],
    templateCols: "code,name,dept,credits,type,faculty,sem,syllabus",
    templateNote: "type=Core/Elective | sem=1–8 | credits=integer",
    aliases: {},
    mapper: (row, i, { depts }) => ({
      code: getImportField(row, "code"),
      name: getImportField(row, "name"),
      dept: resolveImportedDept(getImportField(row, "dept"), depts),
      credits: parseImportInt(getImportField(row, "credits"), 3),
      type: getImportField(row, "type", {}, "Core") || "Core",
      faculty: getImportField(row, "faculty"),
      sem: parseImportInt(getImportField(row, "sem"), 1),
      students: 0,
      syllabus: getImportField(row, "syllabus"),
    }),
    persist: async (record) => {
      await coursesApi.create(record);
      return record;
    },
    setState: (setCourses, newOnes) => setCourses(prev => {
      const ids = new Set(prev.map(x => x.code));
      return [...prev, ...newOnes.filter(x => !ids.has(x.code))];
    }),
  },
  exams: {
    label: "Exams",
    icon: "📝",
    idField: "id",
    requiredCols: ["name", "dept", "type", "date"],
    templateCols: "id,name,dept,type,date,status,total,hall_tickets",
    templateNote: "IDs are optional and auto-generated | type=Internal/Semester/Practical | status=Scheduled/Ongoing/Completed | date=YYYY-MM-DD | hall_tickets=true/false",
    aliases: IMPORT_ALIASES.exams,
    mapper: (row, i, { depts }) => ({
      id: "",
      name: getImportField(row, "name", IMPORT_ALIASES.exams),
      dept: resolveImportedDept(getImportField(row, "dept", IMPORT_ALIASES.exams), depts),
      type: normalizeExamType(getImportField(row, "type", IMPORT_ALIASES.exams)),
      date: normalizeIsoDate(getImportField(row, "date", IMPORT_ALIASES.exams)),
      status: normalizeRecordStatus(getImportField(row, "status", IMPORT_ALIASES.exams), "Scheduled"),
      total: parseImportInt(getImportField(row, "total", IMPORT_ALIASES.exams), 0),
      hall_tickets: parseImportBool(getImportField(row, "hall_tickets", IMPORT_ALIASES.exams), false),
    }),
    persist: async (record) => {
      const res = await examsApi.create(record);
      return { ...record, id: res?.id || record.id };
    },
    setState: (setExams, newOnes) => setExams(prev => {
      const ids = new Set(prev.map(x => x.id));
      return [...prev, ...newOnes.filter(x => !ids.has(x.id))];
    }),
  },
  fees: {
    label: "Student Fees",
    icon: "💰",
    idField: "studentId",
    requiredCols: ["name", "dept"],
    templateCols: "name,dept,year,tuition,hostel,transport,lab,exam,library,sports,development,admission,alumni,medical,placement,it_infra,misc,paid,balance,due_date,status",
    templateNote: "All fee columns in ₹. status=Paid/Pending/Overdue | due_date=YYYY-MM-DD | dept=CSE/ECE etc.",
    aliases: IMPORT_ALIASES.fees,
    mapper: (row, i, { depts }) => ({
      id: "",  // backend auto-generates
      name: getImportField(row, "name", IMPORT_ALIASES.fees),
      dept: resolveImportedDept(getImportField(row, "dept", IMPORT_ALIASES.fees), depts),
      year: parseImportInt(getImportField(row, "year", IMPORT_ALIASES.fees), 1),
      batch: new Date().getFullYear(),
      gender: normalizeGender(getImportField(row, "gender", IMPORT_ALIASES.fees)),
      dob: normalizeIsoDate(getImportField(row, "dob", IMPORT_ALIASES.fees)),
      phone: getImportField(row, "phone", IMPORT_ALIASES.fees),
      email: getImportField(row, "email", IMPORT_ALIASES.fees),
      status: "Active",
      cgpa: 0,
      fee_status: normalizeFeeStatus(getImportField(row, "status", IMPORT_ALIASES.fees)),
      transport: "Own",
      guardian: "",
      address: "",
      tuition: parseImportFloat(getImportField(row, "tuition", IMPORT_ALIASES.fees), 0),
      hostel: parseImportFloat(getImportField(row, "hostel", IMPORT_ALIASES.fees), 0),
      transport_fee: parseImportFloat(getImportField(row, "transport_fee", IMPORT_ALIASES.fees), 0),
      lab: parseImportFloat(getImportField(row, "lab", IMPORT_ALIASES.fees), 0),
      exam: parseImportFloat(getImportField(row, "exam", IMPORT_ALIASES.fees), 0),
      library: parseImportFloat(getImportField(row, "library", IMPORT_ALIASES.fees), 0),
      sports: parseImportFloat(getImportField(row, "sports", IMPORT_ALIASES.fees), 0),
      development: parseImportFloat(getImportField(row, "development", IMPORT_ALIASES.fees), 0),
      admission: parseImportFloat(getImportField(row, "admission", IMPORT_ALIASES.fees), 0),
      alumni_fee: parseImportFloat(getImportField(row, "alumni_fee", IMPORT_ALIASES.fees), 0),
      medical: parseImportFloat(getImportField(row, "medical", IMPORT_ALIASES.fees), 0),
      placement: parseImportFloat(getImportField(row, "placement", IMPORT_ALIASES.fees), 0),
      it_infra: parseImportFloat(getImportField(row, "it_infra", IMPORT_ALIASES.fees), 0),
      miscellaneous: parseImportFloat(getImportField(row, "miscellaneous", IMPORT_ALIASES.fees), 0),
      fees_paid: parseImportFloat(getImportField(row, "paid", IMPORT_ALIASES.fees), 0),
      fees_due: parseImportFloat(getImportField(row, "balance", IMPORT_ALIASES.fees), 0),
      fee_due_date: normalizeIsoDate(getImportField(row, "due_date", IMPORT_ALIASES.fees)) || "2025-07-31",
    }),
    persist: async (record) => {
      const res = await studentsApi.create(record);
      return res?.student || res;
    },
    setState: (setFees, newOnes) => setFees(prev => prev),  // fees tab uses student state
  },
  transport: {
    label: "Transport",
    icon: "🚌",
    idField: "id",
    requiredCols: ["name", "area"],
    templateCols: "id,name,area,stops,driver,bus,time,contact",
    templateNote: "stops=integer | time=departure time e.g. 7:30 AM",
    mapper: (row) => ({
      id: getImportField(row, "id"),
      name: getImportField(row, "name"),
      area: getImportField(row, "area"),
      stops: parseImportInt(getImportField(row, "stops"), 0),
      students: 0,
      driver: getImportField(row, "driver"),
      bus: getImportField(row, "bus"),
      time: getImportField(row, "time"),
      contact: getImportField(row, "contact"),
    }),
    persist: async (record) => {
      const res = await transportApi.create(record);
      return { ...record, id: res?.id || record.id };
    },
    setState: (setRoutes, newOnes) => setRoutes(prev => {
      const ids = new Set(prev.map(x => x.id));
      return [...prev, ...newOnes.filter(x => !ids.has(x.id))];
    }),
  },
};

// Parse a CSV text string → array of row objects
function parseCSV(text) {
  const lines = text.split("\n").map(l => l.replace(/\r$/, "")).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = []; let cur = "", inQ = false;
    for (const ch of lines[i]) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { cols.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    cols.push(cur.trim());
    const row = {};
    headers.forEach((h, idx) => { row[h] = (cols[idx] ?? "").replace(/^"|"$/g, ""); });
    rows.push(row);
  }
  return { headers, rows };
}

// Download a blank CSV template for a section
function downloadTemplate(sectionKey) {
  const sec = IMPORT_SECTIONS[sectionKey];
  if (!sec) return;
  const blob = new Blob([sec.templateCols + "\n"], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `template_${sectionKey}.csv`; a.click();
  URL.revokeObjectURL(url);
}

const ImportModal = ({ onClose, setStudents, setStaff, setCourses, setExams, setFees, setRoutes, depts = [] }) => {
  const [dragOver, setDragOver] = useState(false);
  const [section, setSection] = useState("students");
  const [importLog, setImportLog] = useState([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef();

  const setterMap = { students: setStudents, staff: setStaff, courses: setCourses, exams: setExams, fees: setStudents, transport: setRoutes };

  const processRows = async (rows, headers, filename) => {
    const sec = IMPORT_SECTIONS[section];
    const setter = setterMap[section];
    if (!sec || !setter) { toast("Unknown section", "err"); return; }
    const normalizedHeaders = headers.map(normalizeImportKey).filter(Boolean);
    const normalizedRows = rows.map(normalizeImportRow);

    // Check required columns are present
    const missing = sec.requiredCols.filter(c => !hasImportField(normalizedHeaders, c, sec.aliases || {}));
    if (missing.length) {
      const log = [`📄 File: ${filename}`, `❌ Missing required columns: ${missing.join(", ")}`, `💡 Required: ${sec.requiredCols.join(", ")}`];
      setImportLog(log); toast("Missing required columns", "err"); return;
    }

    // Map rows → records, skip blank name rows
    const mapped = normalizedRows.map((row, index) => sec.mapper(row, index, { depts })).filter(r => {
      const nameVal = r.name || r.code || r.type || r.id;
      return nameVal && String(nameVal).trim() !== "";
    });

    if (!mapped.length) { setImportLog([`📄 File: ${filename}`, "❌ No valid data rows found."]); toast("No valid rows", "err"); return; }

    setImporting(true);
    const successes = [];
    const failures = [];
    for (let index = 0; index < mapped.length; index++) {
      const record = mapped[index];
      try {
        const saved = sec.persist ? await sec.persist(record) : record;
        successes.push(saved || record);
      } catch (err) {
        failures.push({ row: index + 2, message: err?.message || "Failed to import row" });
      }
    }
    setImporting(false);
    if (successes.length) {
      sec.setState(setter, successes);
    }

    setImportLog([
      `📄 File: ${filename}`,
      `📋 ${rows.length} row(s) parsed`,
      `✅ ${successes.length} record(s) saved to ${sec.label}`,
      ...(failures.length ? [`❌ ${failures.length} row(s) failed`, ...failures.slice(0, 5).map((f) => `❌ Row ${f.row}: ${f.message}`)] : []),
    ]);
    toast(
      failures.length
        ? `${successes.length} imported, ${failures.length} failed`
        : `${successes.length} ${sec.label.toLowerCase()} imported`,
      failures.length ? "info" : "ok"
    );
  };

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    const sizeKB = (file.size / 1024).toFixed(1);

    if (ext === "csv") {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const { headers, rows } = parseCSV(e.target.result);
          void processRows(rows, headers, `${file.name} (${sizeKB} KB)`);
        } catch (err) {
          setImportLog([`❌ Parse error: ${err.message}`]);
          toast("CSV parse error", "err");
        }
      };
      reader.readAsText(file);

    } else if (["xls", "xlsx"].includes(ext)) {
      // Use SheetJS (xlsx) which is available as a CDN import in artifacts,
      // but in a real Vite/React project it must be installed: npm i xlsx
      // We attempt dynamic import as a best-effort
      const reader = new FileReader();
      reader.onload = e => {
        try {
          // SheetJS global (loaded via CDN) or via import
          const XLSX = window.XLSX;
          if (!XLSX) {
            setImportLog([
              `📊 Excel file: ${file.name} (${sizeKB} KB)`,
              "⚠️ SheetJS (xlsx) library not found on window.",
              "💡 Run: npm install xlsx  then add  import * as XLSX from 'xlsx'  at the top of CollegeERP.jsx",
              "💡 Or export your sheet as CSV from Excel/Google Sheets and import that.",
            ]);
            toast("xlsx library not loaded — see log", "err");
            return;
          }
          const wb = XLSX.read(e.target.result, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_csv(ws);
          const { headers, rows } = parseCSV(data);
          void processRows(rows, headers, `${file.name} (${sizeKB} KB)`);
        } catch (err) {
          setImportLog([`❌ Excel parse error: ${err.message}`]);
          toast("Excel parse error", "err");
        }
      };
      reader.readAsArrayBuffer(file);

    } else if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
      setImportLog([`🖼️ Image: ${file.name} (${sizeKB} KB)`, "⚠️ Images cannot be auto-parsed.", "💡 Export data as CSV and import that instead."]);
      toast("Images can't be auto-parsed — use CSV", "info");
    } else if (ext === "pdf") {
      setImportLog([`📕 PDF: ${file.name} (${sizeKB} KB)`, "⚠️ PDFs cannot be auto-parsed.", "💡 Export as CSV from your source system."]);
      toast("PDFs can't be auto-parsed — use CSV", "info");
    } else {
      setImportLog([`📁 ${file.name} (${sizeKB} KB)`, "⚠️ Only CSV and Excel files are supported."]);
      toast("Unsupported file type", "err");
    }
  };

  const sec = IMPORT_SECTIONS[section];

  return (
    <Modal title="📥 Import Data" onClose={onClose} footer={<button className="btn btn-secondary" onClick={onClose}>Close</button>}>
      {/* Section selector */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", marginBottom: 6 }}>Import Into</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Object.entries(IMPORT_SECTIONS).map(([key, s]) => (
            <button key={key} onClick={() => { setSection(key); setImportLog([]); }}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: "var(--radius-sm)", border: "1px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)",
                background: section === key ? "var(--blue)" : "var(--bg2)",
                color: section === key ? "#fff" : "var(--text2)",
                borderColor: section === key ? "var(--blue)" : "var(--border)"
              }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template hint */}
      <div className="notif notif-info" style={{ marginBottom: 12 }}>
        <span className="notif-ico">ℹ️</span>
        <div style={{ fontSize: 12 }}>
          <strong>Required columns:</strong> <code style={{ fontSize: 11 }}>{sec.requiredCols.join(", ")}</code><br />
          <strong>All columns:</strong> <code style={{ fontSize: 10 }}>{sec.templateCols}</code><br />
          <span style={{ color: "var(--text3)" }}>{sec.templateNote}</span>
        </div>
      </div>

      {/* Download template button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => downloadTemplate(section)}>⬇ Download CSV Template</button>
      </div>

      {/* Drop zone */}
      <div className={`drop-zone${dragOver ? " drag-over" : ""}`} style={{ marginBottom: 14 }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => fileInputRef.current?.click()}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>{importing ? "⏳" : "📁"}</div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{importing ? "Saving to backend…" : "Drop CSV or Excel here, or click to browse"}</div>
        <p style={{ fontSize: 11, color: "var(--text3)" }}>CSV (auto-parsed ✅) · Excel .xlsx (auto-parsed ✅) · PDF/Images (not supported)</p>
        <input ref={fileInputRef} type="file" accept=".csv,.xls,.xlsx" style={{ display: "none" }}
          onChange={e => { const f = e.target.files[0]; if (f) handleFile(f); e.target.value = ""; }} />
      </div>

      {/* Result log */}
      {importLog.length > 0 && (
        <div style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "12px 14px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", marginBottom: 8, textTransform: "uppercase" }}>Import Result</div>
          {importLog.map((line, i) => (
            <div key={i} style={{
              fontSize: 12, lineHeight: 1.9,
              color: line.startsWith("❌") ? "var(--red)" : line.startsWith("✅") ? "var(--green)" : line.startsWith("⚠️") ? "var(--gold)" : "var(--text2)"
            }}>
              {line}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

// ─── GLOBAL ATTENDANCE STORE (persists across navigation) ──────────────────
const globalAttStore = { data: {} };

// ─── DASHBOARD ─────────────────────────────────────────────────────────────
const Dashboard = ({ setPage, students, staff, exams, fees, courses, depts, alumni, role, userName }) => {
  const perms = PERMS[role];
  const tAmt = fees.reduce((a, f) => a + (Number(f.amount) || 0), 0);
  const tCol = fees.reduce((a, f) => a + (Number(f.collected) || 0), 0);
  const academicDeptCount = resolveDeptIds(depts, ["HUM"], "Academic").length;
  const teachingFacultyCount = staff.filter((member) => member.type === "Teaching").length;
  const activeStudentsCount = students.filter((student) => student.status === "Active").length;
  const activeCoursesCount = courses.length;
  const allMods = [
    { ico: "🎓", lbl: "Students", page: "students" }, { ico: "🏛️", lbl: "Departments", page: "departments" }, { ico: "👨‍🏫", lbl: "Staff", page: "staff" },
    { ico: "📝", lbl: "Exams", page: "exams" }, { ico: "💰", lbl: "Fees", page: "fees" }, { ico: "📖", lbl: "Courses", page: "courses" },
    { ico: "✅", lbl: "Attendance", page: "attendance" }, { ico: "🚌", lbl: "Transport", page: "transport" }, { ico: "📜", lbl: "Certificates", page: "certificates" },
    { ico: "🔬", lbl: "Publications", page: "publications" }, { ico: "🏆", lbl: "AICTE", page: "aicte" }, { ico: "📊", lbl: "Reports", page: "reports" },
    { ico: "👥", lbl: "Alumni", page: "alumni" }, { ico: "📅", lbl: "Batches", page: "batches" },
  ].filter(m => perms.pages.includes(m.page));

  return (
    <div>
      <RoleBanner role={role} userName={userName} />
      <div className="ph"><h1>Institution Overview</h1><p>Vidyasagar Deemed University — Academic Year 2025–26</p></div>
      <div className="stats">
        <Stat label="Total Students" value={students.length} color="blue" icon="🎓" trend={`${activeStudentsCount} active`} />
        <Stat label="Teaching Faculty" value={teachingFacultyCount} color="teal" icon="👨‍🏫" trend={`${staff.filter((member) => member.type === "Support").length} support`} />
        <Stat label="Academic Depts" value={academicDeptCount} color="purple" icon="🏛️" trend={`${alumni.length} alumni`} />
        <Stat label="Active Courses" value={activeCoursesCount} color="green" icon="📖" trend={`${exams.filter((exam) => exam.status !== "Completed").length} exams pending`} />
      </div>
      <div className="mod-grid">
        {allMods.map(m => <div key={m.page} className="mod-item" onClick={() => setPage(m.page)}><div className="mod-ico">{m.ico}</div><div className="mod-lbl">{m.lbl}</div></div>)}
      </div>
      <div className="grid2">
        <div className="card">
          <div className="card-head"><div><div className="card-title">💰 Fee Collection 2025–26</div><div className="card-sub">Overall recovery rate</div></div><span className="badge b-green">{tAmt > 0 ? Math.round((tCol / tAmt) * 100) : 0}% collected</span></div>
          <div className="card-body">
            {fees.map(f => { const amt = Number(f.amount) || 0, col = Number(f.collected) || 0; const pct = amt > 0 ? Math.round((col / amt) * 100) : 0; return (<div key={f.id} style={{ marginBottom: 12 }}><div className="flex-between mb-4"><span style={{ fontSize: 12, fontWeight: 600 }}>{f.type}</span><span className="fc3 fs11">₹{col.toLocaleString()} / ₹{amt.toLocaleString()}</span></div><div className="pbar"><div className="pfill" style={{ width: `${pct}%`, background: pct >= 90 ? "var(--green)" : pct >= 70 ? "var(--gold)" : "var(--red)" }} /></div></div>); })}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><div className="card-title">🕐 Recent Activity</div></div>
          <div className="card-body">
            <div className="tl">
              {[{ c: "tl-blue", ico: "📋", t: "Today, 10:32 AM", txt: "End Sem hall tickets generated for 2,150 students" }, { c: "tl-green", ico: "✅", t: "Today, 9:15 AM", txt: "CSE Sem 6 attendance — 51/56 present" }, { c: "tl-teal", ico: "💳", t: "Yesterday", txt: "Fee payment received — Arjun Mehta (₹1,45,000)" }, { c: "tl-red", ico: "⚠️", t: "2 days ago", txt: "AICTE: 2024-25 annual report upload pending" }, { c: "tl-purple", ico: "📄", t: "3 days ago", txt: "Bonafide certificate issued to Arjun Mehta" }].map((item, i) => (
                <div key={i} className="tl-item"><div className={`tl-dot ${item.c}`}>{item.ico}</div><div className="tl-content"><div className="tl-time">{item.t}</div><div className="tl-text">{item.txt}</div></div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="card att-card">
        <div className="card-head"><div className="card-title">📝 Upcoming Examinations</div></div>
        <div className="tbl-wrap">
          <table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Date</th><th>Students</th><th>Status</th></tr></thead>
            <tbody>{exams.filter(e => e.status !== "Completed").map(e => (<tr key={e.id}><td><span className="mono">{e.id}</span></td><td className="fw6">{e.name}</td><td><span className="badge b-blue">{e.type}</span></td><td className="fc3 fs11">{e.date}</td><td>{e.total?.toLocaleString()}</td><td><span className={`badge ${e.status === "Upcoming" ? "b-gold" : e.status === "Scheduled" ? "b-purple" : "b-green"}`}>{e.status}</span></td></tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── STUDENTS ──────────────────────────────────────────────────────────────
const Students = ({ students, setStudents, depts: liveDepts, role, userName }) => {
  const perms = PERMS[role];
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [yearF, setYearF] = useState("All");
  const [modal, setModal] = useState(null);
  const [viewS, setViewS] = useState(null);
  const [form, setForm] = useState({});
  const deptIds = resolveDeptIds(liveDepts, [], "Academic");
  const deptFilters = ["All", ...deptIds];
  const filtered = students.filter(s => (filter === "All" || s.dept === filter) && (yearF === "All" || String(s.year) === yearF) && (s.name?.toLowerCase().includes(search.toLowerCase()) || s.id?.toLowerCase().includes(search.toLowerCase())));
  const openAdd = () => { setForm({ dept: deptIds[0] || "CSE", year: "1", batch: String(new Date().getFullYear()), gender: "Male", fee_status: "Pending", transport: "Own", status: "Active", cgpa: "0", name: "", phone: "", email: "", guardian: "", address: "", dob: "" }); setModal("add"); };
  const openEdit = (s) => {
    setForm({ ...s, year: String(s.year), batch: String(s.batch || new Date().getFullYear()), cgpa: String(s.cgpa) }); setModal("edit");
  };
  const change = (e) => { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })); };
  const save = async () => {
    if (!form.name?.trim()) { toast("Name is required", "err"); return; }
    const payload = { ...form, year: parseInt(form.year) || 1, batch: parseInt(form.batch) || new Date().getFullYear(), cgpa: parseFloat(form.cgpa) || 0 };
    try {
      if (modal === "add") {
        const res = await studentsApi.create(payload);
        // Backend returns { message, student } — fall back to the payload if student is missing
        const created = (res?.student && res.student.id) ? res.student : { ...payload, id: res?.id || payload.id || `S${Date.now()}` };
        setStudents(prev => [...prev, created]);
        toast("Student added", "ok");
      } else {
        await studentsApi.update(payload.id, payload);
        setStudents(prev => prev.map(s => s.id === payload.id ? payload : s));
        toast("Student updated", "ok");
      }
      setModal(null);
    } catch (err) {
      toast("Save failed: " + err.message, "err");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this student record permanently?")) return;
    try {
      await studentsApi.delete(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      toast("Student deleted", "ok");
    } catch (err) {
      toast("Delete failed: " + err.message, "err");
    }
  };

  return (
    <div>
      <RoleBanner role={role} userName={userName} />
      <div className="ph"><h1>Student Administration</h1><p>Manage student records, profiles and academic status</p></div>
      <div className="stats">
        <Stat label="Total Students" value={students.length} color="blue" icon="🎓" />
        <Stat label="Active" value={students.filter(s => s.status === "Active").length} color="green" icon="✅" />
        <Stat label="Fee Pending" value={students.filter(s => s.fee_status !== "Paid").length} color="orange" icon="⏳" />
        <Stat label="Avg CGPA" value={(students.reduce((a, s) => a + (parseFloat(s.cgpa) || 0), 0) / Math.max(students.length, 1)).toFixed(1)} color="teal" icon="📊" />
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <input placeholder="🔍  Search name or ID…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <select value={yearF} onChange={e => setYearF(e.target.value)} style={{ width: 120 }}>{["All", "1", "2", "3", "4"].map(y => <option key={y} value={y}>{y === "All" ? "All Years" : `Year ${y}`}</option>)}</select>
        {perms.canAdd && <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Student</button>}
      </div>
      <div className="pills">{deptFilters.map(d => <div key={d} className={`pill${filter === d ? " on" : ""}`} onClick={() => setFilter(d)}>{d}</div>)}</div>
      <div className="card att-card">
        <div className="card-head"><div className="card-title">🎓 Students — {filtered.length} records</div><span className="badge b-blue">{filter === "All" ? "All Depts" : filter}</span></div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Dept</th><th>Year</th><th>Batch</th>
                <th>Gender</th><th>DOB</th><th>Phone</th><th>CGPA</th>
                <th>Fee Status</th>
                <th>Transport</th><th>Guardian</th><th>Address</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><span className="mono">{s.id}</span></td>
                  <td><div className="fw6">{s.name}</div><div className="fc3 fs11">{s.email}</div></td>
                  <td><span className="badge b-blue">{s.dept}</span></td>
                  <td className="fc2">Yr {s.year}</td>
                  <td className="fc3 fs11">{s.batch || "—"}</td>
                  <td className="fc3 fs11">{s.gender || "—"}</td>
                  <td className="fc3 fs11">{s.dob || "—"}</td>
                  <td className="fc3 fs11">{s.phone || "—"}</td>
                  <td><span style={{ color: s.cgpa >= 8.5 ? "var(--green)" : s.cgpa >= 7 ? "var(--gold)" : "var(--red)", fontWeight: 700 }}>{s.cgpa}</span></td>
                  <td><span className={`badge ${s.fee_status === "Paid" ? "b-green" : s.fee_status === "Pending" ? "b-gold" : "b-red"}`}>{s.fee_status || "—"}</span></td>
                  <td className="fc3 fs11">{s.transport || "—"}</td>
                  <td className="fc3 fs11">{s.guardian || "—"}</td>
                  <td className="fc3 fs11" style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={s.address}>{s.address || "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="act act-view" onClick={() => setViewS(s)}>View</button>
                      {perms.canEdit && <button className="act act-edit" onClick={() => openEdit(s)}>Edit</button>}
                      {perms.canDelete && <button className="act act-del" onClick={() => del(s.id)}>Del</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="empty"><div className="empty-ico">🎓</div><p>No students match your filters</p></div>}
        </div>
      </div>
      {viewS && (<Modal title="Student Profile" onClose={() => setViewS(null)} footer={<button className="btn btn-secondary" onClick={() => setViewS(null)}>Close</button>}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{[["Student ID", viewS.id], ["Full Name", viewS.name], ["Department", viewS.dept], ["Year", `Year ${viewS.year}`], ["Batch", viewS.batch || "—"], ["Gender", viewS.gender], ["Date of Birth", viewS.dob], ["Phone", viewS.phone], ["Email", viewS.email], ["CGPA", viewS.cgpa], ["Fee Status", viewS.fee_status], ["Transport", viewS.transport], ["Status", viewS.status], ["Guardian", viewS.guardian || "—"], ["Address", viewS.address || "—"]].map(([k, v]) => (<div key={k} style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}><div className="fc3 fs11 mb-4">{k}</div><div className="fw7" style={{ fontSize: 13 }}>{v}</div></div>))}</div></Modal>)}
      {modal && (<Modal title={modal === "add" ? "Add New Student" : "Edit Student"} onClose={() => setModal(null)} footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === "add" ? "Add Student" : "Save Changes"}</button></>}><div className="fg"><FormField label="Full Name *" name="name" value={form.name} onChange={change} full /><FormField label="Department" name="dept" type="select" value={form.dept} onChange={change} opts={deptIds} /><FormField label="Year" name="year" type="select" value={form.year} onChange={change} opts={["1", "2", "3", "4"]} /><FormField label="Batch" name="batch" type="number" value={form.batch} onChange={change} /><FormField label="Gender" name="gender" type="select" value={form.gender} onChange={change} opts={["Male", "Female", "Other"]} /><FormField label="Date of Birth" name="dob" type="date" value={form.dob} onChange={change} /><FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={change} /><FormField label="Email" name="email" type="email" value={form.email} onChange={change} full /><FormField label="Guardian Name" name="guardian" value={form.guardian} onChange={change} /><FormField label="CGPA" name="cgpa" type="number" value={form.cgpa} onChange={change} /><FormField label="Fee Status" name="fee_status" type="select" value={form.fee_status} onChange={change} opts={["Paid", "Pending", "Overdue"]} /><FormField label="Transport" name="transport" type="select" value={form.transport} onChange={change} opts={["Own", "Route A", "Route B", "Route C", "Route D", "Route E"]} /><FormField label="Address" name="address" type="textarea" value={form.address} onChange={change} full /></div></Modal>)}
    </div>
  );
};

// ─── FEES ──────────────────────────────────────────────────────────────────
const FeeTypes = ({ fees, setFees, role }) => {
  const perms = PERMS[role];
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  // Change handler for form fields
  const change = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  // Save function to add fee
  const saveFee = () => {
    if (!form.type || !form.amount) {
      toast("Type and amount required", "err");
      return;
    }
    const newFee = {
      id: `F${Date.now()}`,
      ...form,
      amount: Number(form.amount),
      collected: Number(form.collected || 0),
      pending: Number(form.pending || 0),
    };
    setFees(prev => [...prev, newFee]);
    toast("Fee added", "ok");
    setModal(null);
  };
  // Control bar filter/search UI
  return (
    <div>
      <div className="ph"><h1>Fee Management</h1><p>Manage fee types, amounts, collection and dues</p></div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        {/* Example: add more controls here if needed */}
        <div style={{ flex: 1 }}></div>
        {perms?.canAdd && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setForm({
                type: "Tuition Fee",
                amount: "",
                freq: "Annual",
                due_date: "",
                collected: "0",
                pending: "0"
              });
              setModal("add");
            }}
          >
            + Add Fee
          </button>
        )}
      </div>
      <div className="card att-card">
        <div className="card-head"><div className="card-title">💰 Fees — {fees.length} types</div></div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Frequency</th>
                <th>Due Date</th>
                <th>Collected</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              {fees.map(f => (
                <tr key={f.id}>
                  <td><span className="mono">{f.id}</span></td>
                  <td>{f.type}</td>
                  <td>₹{Number(f.amount).toLocaleString()}</td>
                  <td>{f.freq}</td>
                  <td>{f.due_date}</td>
                  <td>₹{Number(f.collected).toLocaleString()}</td>
                  <td>₹{Number(f.pending).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!fees.length && <div className="empty"><div className="empty-ico">💰</div><p>No fees defined yet</p></div>}
        </div>
      </div>
      {/* Add Fee Modal */}
      {modal === "add" && (
        <Modal
          title="Add Fee"
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveFee}>
                Add Fee
              </button>
            </>
          }
        >
          <div className="fg">
            <FormField label="Fee Type" name="type" value={form.type} onChange={change} />
            <FormField label="Amount" name="amount" type="number" value={form.amount} onChange={change} />
            <FormField label="Frequency" name="freq" value={form.freq} onChange={change} />
            <FormField label="Due Date" name="due_date" type="date" value={form.due_date} onChange={change} />
            <FormField label="Collected" name="collected" type="number" value={form.collected} onChange={change} />
            <FormField label="Pending" name="pending" type="number" value={form.pending} onChange={change} />
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── DEPARTMENTS ───────────────────────────────────────────────────────────
const Departments = ({ depts, setDepts, students, staff, pubs, role, userName }) => {
  const perms = PERMS[role];
  const [sel, setSel] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // Derive live student count per dept from the real students array
  const deptStudentCount = (deptId) =>
    students.filter(s => s.dept === deptId && s.status === "Active").length;

  // Derive live faculty count per dept from real staff (Teaching + Active)
  const deptFacultyCount = (deptId) =>
    (staff || []).filter(s => s.dept === deptId && s.type === "Teaching" && s.status === "Active").length;

  // Derive live publication count per dept by matching author names to staff in that dept
  const deptPubCount = (deptId) => {
    const deptStaffNames = new Set(
      (staff || []).filter(s => s.dept === deptId && s.type === "Teaching" && s.status === "Active").map(s => s.name)
    );
    return (pubs || []).filter(p => deptStaffNames.has(p.author)).length;
  };

  // Enrich depts with live student AND live faculty counts
  const enriched = resolveDeptRecords(depts).map(d => ({
    ...d,
    students: deptStudentCount(d.id),
    faculty: deptFacultyCount(d.id) > 0 ? deptFacultyCount(d.id) : (d.faculty || 0),
    publications: deptPubCount(d.id),
  }));
  const academicDepts = enriched.filter((dept) => dept.category === "Academic");
  const adminDepts = enriched.filter((dept) => dept.category === "Administrative");

  const openAdd = () => { setForm({ id: "", name: "", hod: "", faculty: "0", estd: "2025", pg: "", category: "Academic" }); setModal("add"); };
  const openEdit = (d) => { setForm({ ...d, faculty: String(d.faculty), estd: String(d.estd), category: normalizeDeptCategory(d) }); setModal("edit"); };

  const renderDeptTable = (title, icon, rows, emptyText) => (
    <div className="card">
      <div className="card-head"><div className="card-title">{icon} {title}</div></div>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Code</th><th>Department</th><th>Category</th><th>Head of Dept</th><th>Faculty</th><th>Students</th><th>F:S Ratio</th><th>Estd</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map(d => (
              <tr key={d.id}>
                <td><span className="badge b-blue">{d.id}</span></td>
                <td className="fw6">{d.name}</td>
                <td><span className={`badge ${d.category === "Administrative" ? "b-gray" : "b-purple"}`}>{d.category}</span></td>
                <td style={{ fontSize: 12 }}>{d.hod || "—"}</td>
                <td>{d.faculty}</td>
                <td><strong>{d.students}</strong></td>
                <td><span className={`badge ${d.students > 0 && d.faculty > 0 && Math.round(d.students / d.faculty) > 15 ? "b-red" : "b-green"}`}>{d.students > 0 && d.faculty > 0 ? `1:${Math.round(d.students / d.faculty)}` : "—"}</span></td>
                <td>{d.estd}</td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="act act-view" onClick={() => setSel(d)}>Details</button>
                    {perms.canEdit && <button className="act act-edit" onClick={() => openEdit(d)}>Edit</button>}
                    {perms.canDelete && <button className="act act-del" onClick={async () => { if (window.confirm("Delete this department?")) { try { await deptsApi.delete(d.id); setDepts(p => p.filter(x => x.id !== d.id)); toast("Deleted", "ok"); } catch (err) { toast(err.message || "Failed to delete department", "err"); } } }}>Del</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <div className="empty"><div className="empty-ico">🏛️</div><p>{emptyText}</p></div>}
      </div>
    </div>
  );

  const save = async () => {
    const payload = {
      ...form,
      id: String(form.id || "").trim().toUpperCase(),
      faculty: parseInt(form.faculty) || 0,
      estd: parseInt(form.estd) || 2025,
      category: form.category === "Administrative" ? "Administrative" : "Academic",
    };
    if (!payload.id?.trim()) { toast("Department code required", "err"); return; }
    if (modal === "add") {
      if (depts.find(d => d.id === payload.id)) { toast("Department code already exists", "err"); return; }
      try {
        await deptsApi.create(payload);
        setDepts(p => [...p, payload]);
        toast("Department added", "ok");
      } catch (err) {
        toast(err.message || "Failed to add department", "err"); return;
      }
    } else {
      try {
        await deptsApi.update(form.id, payload);
        setDepts(p => p.map(d => d.id === form.id ? payload : d));
        toast("Department updated", "ok");
      } catch (err) {
        toast(err.message || "Failed to update department", "err"); return;
      }
    }
    setModal(null);
  };

  const totalStudents = students.filter(s => s.status === "Active").length;

  return (
    <div>
      <RoleBanner role={role} userName={userName} />
      <div className="ph"><h1>Departments & Units</h1><p>Academic departments and non-academic support units, each tracked separately</p></div>
      <div className="stats">
        <Stat label="Academic Depts" value={academicDepts.length} color="blue" icon="🏛️" />
        <Stat label="Support Units" value={adminDepts.length} color="teal" icon="🏢" />
        <Stat label="Total Faculty" value={enriched.reduce((a, d) => a + d.faculty, 0)} color="gold" icon="👨‍🏫" />
        <Stat label="Total Students" value={totalStudents} color="teal" icon="🎓" />
        <Stat label="Total Publications" value={academicDepts.reduce((a, d) => a + d.publications, 0)} color="purple" icon="📄" />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        {perms.canAdd && <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Department</button>}
      </div>
      {renderDeptTable("Academic Departments", "🎓", academicDepts, "No academic departments found")}
      <div style={{ height: 16 }} />
      {renderDeptTable("Administrative / Support Units", "🏢", adminDepts, "No administrative or support units found")}

      {sel && (
        <Modal title={sel.name} onClose={() => setSel(null)} footer={<button className="btn btn-secondary" onClick={() => setSel(null)}>Close</button>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["Code", sel.id], ["Category", normalizeDeptCategory(sel)], ["HOD", sel.hod || "—"], ["Faculty", sel.faculty], ["Students (live)", deptStudentCount(sel.id)], ["Established", sel.estd], ["PG Programs", sel.pg || "—"]].map(([k, v]) => (
              <div key={k} style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "12px" }}>
                <div className="fc3 fs11 mb-4">{k}</div>
                <div className="fw7" style={{ fontSize: 13 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            {normalizeDeptCategory(sel) === "Academic" ? (
              <div className={`notif ${sel.faculty > 0 && Math.round(deptStudentCount(sel.id) / sel.faculty) > 15 ? "notif-warn" : "notif-ok"}`}>
                <span className="notif-ico">{sel.faculty > 0 && Math.round(deptStudentCount(sel.id) / sel.faculty) > 15 ? "⚠️" : "✅"}</span>
                <span>F:S ratio for {sel.id} is {sel.faculty > 0 ? `1:${Math.round(deptStudentCount(sel.id) / sel.faculty)}` : "N/A"}. AICTE norm: ≤ 1:15</span>
              </div>
            ) : (
              <div className="notif notif-info">
                <span className="notif-ico">ℹ️</span>
                <span>{sel.id} is maintained as a non-academic support unit and is excluded from student/course attendance workflows.</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title={modal === "add" ? "Add Department" : "Edit Department"} onClose={() => setModal(null)} footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <div className="notif notif-info" style={{ marginBottom: 14 }}>
            <span className="notif-ico">ℹ️</span>
            <span>Academic departments appear in student, course, fees, batch and attendance workflows. Administrative units stay separate and are available mainly for staffing and records.</span>
          </div>
          <div className="fg">
            <FormField label="Department Code *" name="id" value={form.id} onChange={change} />
            <FormField label="Category" name="category" type="select" value={form.category} onChange={change} opts={["Academic", "Administrative"]} />
            <FormField label="Established Year" name="estd" type="number" value={form.estd} onChange={change} />
            <FormField label="Full Name" name="name" value={form.name} onChange={change} full />
            <FormField label="Head of Department" name="hod" value={form.hod} onChange={change} full />
            <FormField label="Faculty Count" name="faculty" type="number" value={form.faculty} onChange={change} />
            <FormField label="PG Programs" name="pg" value={form.pg} onChange={change} full />
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── STAFF ─────────────────────────────────────────────────────────────────
const Staff = ({ staff, setStaff, pubs, depts: liveDepts, role, userName }) => {
  const perms = PERMS[role];
  // Live publication count per staff member — derived from shared pubs state
  const livePubCount = (staffId) => (pubs || []).filter(p => p.staff_id === staffId).length;
  const [tab, setTab] = useState("Teaching");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");
  const deptOptions = resolveDeptIds(liveDepts, ["ADM", "LIB"]);
  const academicDeptOptions = resolveDeptIds(liveDepts, ["HUM"], "Academic");
  const adminDeptOptions = resolveDeptIds(liveDepts, ["ADM", "LIB"], "Administrative");
  const filtered = staff.filter(s => s.type === tab && (s.name.toLowerCase().includes(search.toLowerCase()) || s.dept?.toLowerCase().includes(search.toLowerCase())));
  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const openAdd = () => { setForm({ dept: (tab === "Support" ? adminDeptOptions[0] : academicDeptOptions[0]) || deptOptions[0] || "CSE", type: tab, qual: "M.Tech", status: "Active", publications: "0", exp: "1", name: "", role: "", email: "", phone: "" }); setModal("add"); };
  const openEdit = (s) => { setForm({ ...s, exp: String(s.exp), publications: String(s.publications || 0) }); setModal("edit"); };
  const save = async () => {
    if (!form.name?.trim()) { toast("Name required", "err"); return; }
    const payload = { ...form, type: tab, exp: parseInt(form.exp) || 0, publications: parseInt(form.publications) || 0 };
    try {
      if (modal === "add") {
        await staffApi.create(payload);
      } else {
        await staffApi.update(form.id, payload);
      }
      const res = await staffApi.list();
      setStaff(Array.isArray(res?.staff) ? res.staff : []);
      toast(modal === "add" ? "Staff added" : "Staff updated", "ok");
      setModal(null);
    } catch (err) {
      toast(err.message || "Failed to save staff", "err");
    }
  };
  return (
    <div>
      <RoleBanner role={role} userName={userName} />
      <div className="ph"><h1>Staff Management</h1><p>Teaching faculty and support staff records</p></div>
      <div className="stats"><Stat label="Teaching Faculty" value={staff.filter(s => s.type === "Teaching").length} color="blue" icon="👨‍🏫" /><Stat label="Support Staff" value={staff.filter(s => s.type === "Support").length} color="teal" icon="🛠️" /><Stat label="Ph.D. Holders" value={staff.filter(s => s.qual === "Ph.D.").length} color="purple" icon="🎓" /><Stat label="Avg Experience" value={`${Math.round(staff.reduce((a, s) => a + (parseInt(s.exp) || 0), 0) / Math.max(staff.length, 1))}y`} color="gold" icon="📅" /></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div className="tabs" style={{ marginBottom: 0, border: "none" }}>{["Teaching", "Support"].map(t => <div key={t} className={`tab${tab === t ? " on" : ""}`} onClick={() => setTab(t)}>{t} Staff</div>)}</div>
        <div style={{ display: "flex", gap: 10 }}><input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 180 }} />{perms.canAdd && <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Staff</button>}</div>
      </div>
      <div className="card"><div className="tbl-wrap"><table><thead><tr><th>ID</th><th>Name</th><th>Dept</th><th>Role</th><th>Qual.</th><th>Exp</th>{tab === "Teaching" && <th>Pubs 🔗</th>}<th>Actions</th></tr></thead><tbody>{filtered.map(s => (<tr key={s.id}><td><span className="mono">{s.id}</span></td><td><div className="fw6">{s.name}</div><div className="fc3 fs11">{s.email}</div></td><td><span className="badge b-blue">{s.dept}</span></td><td className="fs11 fc2">{s.role}</td><td><span className={`badge ${s.qual === "Ph.D." ? "b-gold" : "b-gray"}`}>{s.qual}</span></td><td className="fc2">{s.exp}y</td>{tab === "Teaching" && <td><span className="badge b-purple" title="Live count from Publications section">{livePubCount(s.id)}</span></td>}<td><div style={{ display: "flex", gap: 4 }}>{perms.canEdit && <button className="act act-edit" onClick={() => openEdit(s)}>Edit</button>}{perms.canDelete && <button className="act act-del" onClick={async () => {
        if (!window.confirm("Remove?")) return;
        try {
          await staffApi.delete(s.id);
          const res = await staffApi.list();
          setStaff(Array.isArray(res?.staff) ? res.staff : []);
          toast("Removed", "ok");
        } catch (err) {
          toast(err.message || "Failed to delete staff", "err");
        }
      }}>Del</button>}</div></td></tr>))}</tbody></table>{!filtered.length && <div className="empty"><div className="empty-ico">👨‍🏫</div><p>No {tab} staff found</p></div>}</div></div>
      {modal && (<Modal title={`${modal === "add" ? "Add" : "Edit"} ${tab} Staff`} onClose={() => setModal(null)} footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}><div className="fg"><FormField label="Full Name *" name="name" value={form.name} onChange={change} full /><FormField label="Department" name="dept" type="select" value={form.dept} onChange={change} opts={deptOptions} /><FormField label="Role / Designation" name="role" value={form.role} onChange={change} full /><FormField label="Qualification" name="qual" type="select" value={form.qual} onChange={change} opts={["Ph.D.", "M.Tech", "M.E.", "MBA", "MLIS", "B.Tech", "MCA"]} /><FormField label="Experience (years)" name="exp" type="number" value={form.exp} onChange={change} />{tab === "Teaching" && <div className="fgrp"><label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text3)" }}>Publications (auto from Publications section)</label><input value={livePubCount(form.id)} readOnly style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontSize: 13, color: "var(--blue)", fontWeight: 700, fontFamily: "var(--font-mono)", width: "100%" }} /></div>}<FormField label="Email" name="email" type="email" value={form.email} onChange={change} /><FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={change} /><FormField label="Status" name="status" type="select" value={form.status} onChange={change} opts={["Active", "On Leave", "Inactive"]} /></div></Modal>)}
    </div>
  );
};

// ─── COURSES ───────────────────────────────────────────────────────────────
const Courses = ({ courses, setCourses, students, staff, depts: liveDepts, role, userName }) => {
  const perms = PERMS[role];
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [detailC, setDetailC] = useState(null);
  const [form, setForm] = useState({});
  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const deptOptions = resolveDeptIds(liveDepts, ["HUM"], "Academic");
  const depts = ["All", ...new Set([...deptOptions, ...courses.map(c => c.dept).filter(Boolean)])];
  const filtered = courses.filter(c => filter === "All" || c.dept === filter);
  const openAdd = () => { setForm({ dept: deptOptions[0] || "CSE", credits: "3", type: "Core", sem: "1", students: "0", code: "", name: "", faculty: "", syllabus: "" }); setModal("add"); };
  const openEdit = (c) => { setForm({ ...c, credits: String(c.credits), sem: String(c.sem), students: String(c.students || 0) }); setModal("edit"); };

  // Derive live enrolled count for a course from the students module:
  // students in matching dept are considered enrolled in that dept's courses
  const enrolledCount = (course) => {
    const deptStudents = (students || []).filter(s => s.dept === course.dept && s.status === "Active");
    return deptStudents.length > 0 ? deptStudents.length : (parseInt(course.students) || 0);
  };

  const save = async () => {
    if (!form.code?.trim() || !form.name?.trim()) { toast("Code and name required", "err"); return; }
    const payload = { ...form, credits: parseInt(form.credits) || 3, sem: parseInt(form.sem) || 1, students: parseInt(form.students) || 0 };
    try {
      if (modal === "add") {
        await coursesApi.create(payload);
      } else {
        await coursesApi.update(form.code, payload);
      }
      const res = await coursesApi.list();
      setCourses(Array.isArray(res?.courses) ? res.courses : []);
      toast(modal === "add" ? "Course added" : "Course updated", "ok");
      setModal(null);
    } catch (err) {
      toast(err.message || "Failed to save course", "err");
    }
  };

  const deleteCourse = async (c) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await coursesApi.delete(c.code);
      const res = await coursesApi.list();
      setCourses(Array.isArray(res?.courses) ? res.courses : []);
      toast("Deleted", "ok");
    } catch (err) {
      toast(err.message || "Failed to delete course", "err");
    }
  };

  return (
    <div>
      <RoleBanner role={role} userName={userName} />
      <div className="ph"><h1>Course Structure</h1><p>Curriculum, credits, faculty assignments and syllabi</p></div>
      <div className="stats"><Stat label="Total Courses" value={courses.length} color="blue" icon="📖" /><Stat label="Core" value={courses.filter(c => c.type === "Core").length} color="teal" icon="📚" /><Stat label="Electives" value={courses.filter(c => c.type === "Elective").length} color="purple" icon="🎯" /><Stat label="Total Credits" value={courses.reduce((a, c) => a + (parseInt(c.credits) || 0), 0)} color="gold" icon="⭐" /></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><div className="pills" style={{ marginBottom: 0 }}>{depts.map(d => <div key={d} className={`pill${filter === d ? " on" : ""}`} onClick={() => setFilter(d)}>{d}</div>)}</div>{perms.canAdd && <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Course</button>}</div>
      <div className="card"><div className="tbl-wrap"><table><thead><tr><th>Code</th><th>Course Name</th><th>Dept</th><th>Sem</th><th>Credits</th><th>Type</th><th>Faculty</th><th>Enrolled</th><th>Actions</th></tr></thead><tbody>{filtered.map(c => (<tr key={c.code}><td><span className="mono">{c.code}</span></td><td className="fw6">{c.name}</td><td><span className="badge b-blue">{c.dept}</span></td><td className="fc2 fs11">Sem {c.sem}</td><td><span className="badge b-teal">{c.credits} Cr</span></td><td><span className={`badge ${c.type === "Core" ? "b-gold" : c.type === "Elective" ? "b-purple" : "b-gray"}`}>{c.type}</span></td><td className="fc2 fs11">{c.faculty}</td><td><span className="badge b-teal">{enrolledCount(c)}</span></td><td><div style={{ display: "flex", gap: 4 }}><button className="act act-view" onClick={() => setDetailC(c)}>Syllabus</button>{perms.canEdit && <button className="act act-edit" onClick={() => openEdit(c)}>Edit</button>}{perms.canDelete && <button className="act act-del" onClick={() => deleteCourse(c)}>Del</button>}</div></td></tr>))}</tbody></table>{!filtered.length && <div className="empty"><div className="empty-ico">📖</div><p>No courses for this dept</p></div>}</div></div>
      {detailC && (<Modal title={`${detailC.code} — ${detailC.name}`} onClose={() => setDetailC(null)} footer={<button className="btn btn-secondary" onClick={() => setDetailC(null)}>Close</button>}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>{[["Code", detailC.code], ["Dept", detailC.dept], ["Semester", `Sem ${detailC.sem}`], ["Credits", `${detailC.credits} Cr`], ["Type", detailC.type], ["Faculty", detailC.faculty], ["Enrolled Students", enrolledCount(detailC)]].map(([k, v]) => (<div key={k} style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}><div className="fc3 fs11 mb-4">{k}</div><div className="fw7" style={{ fontSize: 13 }}>{v}</div></div>))}</div><div style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "14px" }}><div className="fc3 fs11 mb-8" style={{ fontWeight: 700, textTransform: "uppercase" }}>Syllabus Overview</div><div style={{ fontSize: 13, lineHeight: 1.7 }}>{detailC.syllabus || "Not uploaded yet."}</div></div></Modal>)}
      {modal && (<Modal title={`${modal === "add" ? "Add" : "Edit"} Course`} onClose={() => setModal(null)} footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save Course</button></>}><div className="fg"><FormField label="Course Code *" name="code" value={form.code} onChange={change} /><FormField label="Course Name *" name="name" value={form.name} onChange={change} full /><FormField label="Department" name="dept" type="select" value={form.dept} onChange={change} opts={deptOptions} /><FormField label="Semester" name="sem" type="select" value={form.sem} onChange={change} opts={["1", "2", "3", "4", "5", "6", "7", "8"]} /><FormField label="Credits" name="credits" type="number" value={form.credits} onChange={change} /><FormField label="Type" name="type" type="select" value={form.type} onChange={change} opts={["Core", "Elective", "Mandatory", "Lab"]} /><FormField label="Faculty Assigned" name="faculty" value={form.faculty} onChange={change} full /><FormField label="Syllabus" name="syllabus" type="textarea" value={form.syllabus} onChange={change} full /></div></Modal>)}
    </div>
  );
};

// ─── EXAMS ─────────────────────────────────────────────────────────────────
const Exams = ({ exams, setExams, students, depts: liveDepts, role, userName }) => {
  const perms = PERMS[role];
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({});
  const deptOptions = resolveDeptIds(liveDepts);
  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const statuses = ["All", "Scheduled", "Upcoming", "Ongoing", "Completed"];
  const filtered = exams.filter(e => filter === "All" || e.status === filter);
  const openAdd = () => { setForm({ dept: "All", type: "Internal", status: "Scheduled", hall_tickets: "false", total: "0", name: "", date: "" }); setModal("add"); };
  // Compute live student count for an exam based on its dept
  const liveExamCount = (e) => {
    const dept = e.dept || "All";
    if (!e.dept || dept === "All") return students ? students.filter(s => s.status === "Active").length : (parseInt(e.total) || 0);
    return students ? students.filter(s => s.dept === dept && s.status === "Active").length : (parseInt(e.total) || 0);
  };
  const openEdit = (e) => { setForm({ ...e, total: String(e.total), hall_tickets: String(e.hall_tickets) }); setModal("edit"); };
  const save = async () => {
    if (!form.name?.trim()) { toast("Name required", "err"); return; }
    const payload = { ...form, total: parseInt(form.total) || 0, hall_tickets: form.hall_tickets === "true" };
    try {
      if (modal === "add") {
        await examsApi.create(payload);
      } else {
        await examsApi.update(form.id, payload);
      }
      const res = await examsApi.list();
      setExams(Array.isArray(res?.exams) ? res.exams : []);
      toast(modal === "add" ? "Exam scheduled" : "Exam updated", "ok");
      setModal(null);
    } catch (err) {
      toast(err.message || "Failed to save exam", "err");
    }
  };
  return (
    <div>
      <RoleBanner role={role} userName={userName} />
      <div className="ph"><h1>Examination Management</h1><p>Schedule, track and manage all examinations</p></div>
      <div className="stats"><Stat label="Total Exams" value={exams.length} color="blue" icon="📝" /><Stat label="Completed" value={exams.filter(e => e.status === "Completed").length} color="green" icon="✅" /><Stat label="Upcoming" value={exams.filter(e => ["Upcoming", "Scheduled"].includes(e.status)).length} color="gold" icon="📅" /><Stat label="Hall Tickets" value={exams.filter(e => e.hall_tickets === true || e.hall_tickets === "true").length} color="purple" icon="🎫" /></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><div className="pills" style={{ marginBottom: 0 }}>{statuses.map(s => <div key={s} className={`pill${filter === s ? " on" : ""}`} onClick={() => setFilter(s)}>{s}</div>)}</div>{perms.canAdd && <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Schedule Exam</button>}</div>
      <div className="card"><div className="tbl-wrap"><table><thead><tr><th>ID</th><th>Examination Name</th><th>Dept</th><th>Type</th><th>Date</th><th>Students</th><th>Hall Tickets</th><th>Actions</th></tr></thead><tbody>{filtered.map(e => (<tr key={e.id}><td><span className="mono">{e.id}</span></td><td className="fw6">{e.name}</td><td><span className="badge b-blue">{e.dept}</span></td><td><span className="badge b-purple">{e.type}</span></td><td className="fc3 fs11">{e.date}</td><td>{liveExamCount(e).toLocaleString()}</td><td>{(e.hall_tickets === true || e.hall_tickets === "true") ? <span className="badge b-green">Issued</span> : <span className="badge b-gray">Pending</span>}</td><td><div style={{ display: "flex", gap: 4 }}>{perms.canEdit && <button className="act act-edit" onClick={() => openEdit(e)}>Edit</button>}{perms.canDelete && <button className="act act-del" onClick={async () => {
        if (!window.confirm("Delete?")) return;
        try {
          await examsApi.delete(e.id);
          const res = await examsApi.list();
          setExams(Array.isArray(res?.exams) ? res.exams : []);
          toast("Deleted", "ok");
        } catch (err) {
          toast(err.message || "Failed to delete exam", "err");
        }
      }}>Del</button>}</div></td></tr>))}</tbody></table>{!filtered.length && <div className="empty"><div className="empty-ico">📝</div><p>No exams match this filter</p></div>}</div></div>
      {modal && (<Modal title={modal === "add" ? "Schedule Examination" : "Edit Examination"} onClose={() => setModal(null)} footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save Exam</button></>}><div className="fg"><FormField label="Exam Name *" name="name" value={form.name} onChange={change} full /><FormField label="Department" name="dept" type="select" value={form.dept} onChange={change} opts={["All", ...deptOptions]} /><FormField label="Type" name="type" type="select" value={form.type} onChange={change} opts={["Semester", "Mid Term", "Internal", "Supplementary", "Practical"]} /><FormField label="Date" name="date" type="date" value={form.date} onChange={change} /><FormField label="Total Students" name="total" type="number" value={form.total} onChange={change} /><FormField label="Status" name="status" type="select" value={form.status} onChange={change} opts={["Scheduled", "Upcoming", "Ongoing", "Completed"]} /><FormField label="Hall Tickets" name="hall_tickets" type="select" value={form.hall_tickets} onChange={change} opts={[{ v: "false", l: "Pending" }, { v: "true", l: "Issued" }]} /></div></Modal>)}
    </div>
  );
};

// ─── ATTENDANCE ────────────────────────────────────────────────────────────
const Attendance = ({ students, courses, depts: liveDepts, role, userName }) => {
  const perms = PERMS[role];
  const [selDept, setSelDept] = useState("CSE");
  const [selSubject, setSelSubject] = useState("Data Structures");
  const [selMonth, setSelMonth] = useState(CURRENT_MONTH);
  const [showBulk, setShowBulk] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ studentId: "", day: "1", status: "P" });

  const deptOptions = resolveDeptIds(liveDepts, ["HUM"], "Academic");

  // Single source of truth: attData is a plain object stored in state
  // so every mutation triggers a real React re-render automatically.
  // Shape: { [storeKey]: { [studentId]: { [day]: "P"|"A"|"H" } } }
  const [attData, setAttData] = useState(() => globalAttStore.data);

  // Keep globalAttStore in sync so it survives navigation (module re-mount)
  const updateAtt = (newData) => {
    globalAttStore.data = newData;
    setAttData(newData);
  };
  const replaceSheet = (key, sheetData) => {
    setAttData((prev) => {
      const next = { ...prev, [key]: sheetData };
      globalAttStore.data = next;
      return next;
    });
  };

  // Hidden students are sourced from backend exclusions per sheet.
  const [hiddenMap, setHiddenMap] = useState({});
  const [sheetLoading, setSheetLoading] = useState(false);

  const storeKey = `${selDept}|${selSubject}|${selMonth}`;
  const subjects = resolveDeptSubjects(selDept, courses);
  const deptOptionsKey = deptOptions.join("|");
  const subjectKey = subjects.join("|");
  const totalDaysInMonth = getDaysInMonth(selMonth);
  const allDays = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);
  const workingDays = allDays.filter(d => !isSunday(selMonth, d));
  // Days that have actually passed (or are today) — used for % calculation
  const conductedDays = workingDays.filter(d => !isFutureDate(selMonth, d));
  const parsedMonth = parseMonthLabel(selMonth);
  const attendanceYear = parsedMonth?.year || new Date().getFullYear();
  const attendanceMonthNum = parsedMonth ? String(parsedMonth.monthIndex + 1).padStart(2, "0") : "";

  useEffect(() => {
    let cancelled = false;

    const loadSheet = async () => {
      if (!attendanceMonthNum) return;
      setSheetLoading(true);
      try {
        const res = await attendanceApi.list({
          dept: selDept,
          month: selMonth,
          year: attendanceYear,
          subject: selSubject,
        });
        if (cancelled) return;

        const excluded = new Set(Array.isArray(res?.excluded_students) ? res.excluded_students : []);
        const nextSheet = {};
        (Array.isArray(res?.records) ? res.records : []).forEach((row) => {
          const sid = row.student_id || row.studentId;
          const day = parseInt((row.date || "").split("-")[2], 10);
          if (!sid || !day) return;
          if (!nextSheet[sid]) nextSheet[sid] = {};
          nextSheet[sid][day] = row.status || "P";
        });

        setHiddenMap((prev) => ({ ...prev, [storeKey]: excluded }));
        replaceSheet(storeKey, nextSheet);
      } catch (err) {
        console.warn("Attendance load failed:", err.message);
      } finally {
        if (!cancelled) setSheetLoading(false);
      }
    };

    loadSheet();
    return () => { cancelled = true; };
  }, [attendanceMonthNum, attendanceYear, conductedDays.join(","), selDept, selMonth, selSubject, storeKey, students]);

  useEffect(() => {
    if (!deptOptions.length) return;
    if (!deptOptions.includes(selDept)) {
      setSelDept(deptOptions[0]);
      return;
    }
    if (!subjects.includes(selSubject)) {
      setSelSubject(subjects[0]);
    }
  }, [deptOptionsKey, subjectKey, selDept, selSubject]);

  const handleDeptChange = (newDept) => {
    setSelDept(newDept);
    const newSubjs = resolveDeptSubjects(newDept, courses);
    setSelSubject(newSubjs[0] || "");
  };

  // Derive hidden set from state (not localStorage directly) so deletes are live
  const hiddenSet = hiddenMap[storeKey] || new Set();

  // Which students appear in the grid
  const currentStoreData = attData[storeKey] || {};
  const baseDeptStudents = students.filter(s =>
    s.dept === selDept && s.status === "Active" && !hiddenSet.has(s.id)
  );
  // Any extra students added via "Add Entry" from another dept
  const extraStudentIds = Object.keys(currentStoreData).filter(sid => {
    const stu = students.find(s => s.id === sid);
    return stu && stu.dept !== selDept && !hiddenSet.has(sid);
  });
  const extraStudents = extraStudentIds
    .map(sid => students.find(s => s.id === sid))
    .filter(Boolean);
  const visibleStudents = [...baseDeptStudents, ...extraStudents];

  const getRecord = (sid) => {
    return currentStoreData[sid] || {};
  };

  const toggle = async (sid, day) => {
    if (!perms.canEdit || isSunday(selMonth, day) || isFutureDate(selMonth, day)) return;
    const existing = attData[storeKey] || {};
    const rec = existing[sid] || {};
    const cur = rec[day] || "";
    const next = cur === "" ? "P" : cur === "P" ? "A" : cur === "A" ? "H" : "P";
    const nextSheet = { ...existing, [sid]: { ...rec, [day]: next } };
    updateAtt({
      ...attData,
      [storeKey]: nextSheet,
    });
    try {
      const student = students.find(s => s.id === sid);
      await attendanceApi.mark({
        student_id: sid,
        student_name: student?.name || sid,
        dept: selDept,
        date: parsedMonth ? `${attendanceYear}-${attendanceMonthNum}-${String(day).padStart(2, "0")}` : "",
        status: next,
        month: selMonth,
        year: attendanceYear,
        subject: selSubject,
      });
    } catch (err) {
      updateAtt({ ...attData, [storeKey]: existing });
      toast(`Could not save attendance: ${err.message}`, "err");
    }
  };

  const markAll = async (status) => {
    const existing = attData[storeKey] || {};
    const updated = {};
    visibleStudents.forEach(({ id: sid }) => {
      updated[sid] = {};
      conductedDays.forEach((d) => { updated[sid][d] = status; });
    });
    const payload = visibleStudents.flatMap((student) =>
      conductedDays.map((day) => ({
        student_id: student.id,
        student_name: student.name || student.id,
        dept: selDept,
        date: `${attendanceYear}-${attendanceMonthNum}-${String(day).padStart(2, "0")}`,
        status,
        month: selMonth,
        year: attendanceYear,
        subject: selSubject,
      })),
    );
    try {
      await attendanceApi.markBulk(payload);
      updateAtt({ ...attData, [storeKey]: { ...existing, ...updated } });
      toast(`All marked as ${status === "P" ? "Present" : "Absent"}`, "ok");
      setShowBulk(false);
    } catch (err) {
      toast(`Could not save bulk attendance: ${err.message}`, "err");
    }
  };

  const saveEntry = async () => {
    if (!addForm.studentId) { toast("Select a student", "err"); return; }
    const day = parseInt(addForm.day) || 1;
    if (day < 1 || day > totalDaysInMonth) { toast(`Day must be 1–${totalDaysInMonth}`, "err"); return; }
    if (isSunday(selMonth, day)) { toast("Cannot mark on Sundays", "err"); return; }
    if (isFutureDate(selMonth, day)) { toast("Cannot mark attendance for a future date", "err"); return; }

    const existing = attData[storeKey] || {};
    const sid = addForm.studentId;
    let rec = existing[sid] ? { ...existing[sid] } : {};
    rec[day] = addForm.status;
    try {
      const student = students.find((s) => s.id === sid);
      await attendanceApi.mark({
        student_id: sid,
        student_name: student?.name || sid,
        dept: selDept,
        date: `${attendanceYear}-${attendanceMonthNum}-${String(day).padStart(2, "0")}`,
        status: addForm.status,
        month: selMonth,
        year: attendanceYear,
        subject: selSubject,
      });
      setHiddenMap((prev) => {
        const prevSet = prev[storeKey] ? new Set(prev[storeKey]) : new Set();
        prevSet.delete(sid);
        return { ...prev, [storeKey]: prevSet };
      });
      updateAtt({ ...attData, [storeKey]: { ...existing, [sid]: rec } });
      toast("Entry saved", "ok");
      setShowAdd(false);
    } catch (err) {
      toast(`Could not save attendance entry: ${err.message}`, "err");
    }
  };

  // Map internal P/A/H/SUN → CSS class names matching reference style
  const getCellClass = (val) => {
    if (val === "P") return "present";
    if (val === "A") return "absent";
    if (val === "H") return "holiday";
    if (val === "SUN") return "sun";
    if (val === "FUTURE") return "future";
    return "empty";
  };

  const markedAttendanceDays = (rec) =>
    conductedDays.filter((d) => rec[d] === "P" || rec[d] === "A");

  const totalPresent = visibleStudents.reduce((acc, student) => {
    const rec = getRecord(student.id);
    return acc + markedAttendanceDays(rec).filter((d) => rec[d] === "P").length;
  }, 0);
  const totalSlots = visibleStudents.reduce((acc, student) => acc + markedAttendanceDays(getRecord(student.id)).length, 0);
  const hasSavedAttendance = Object.values(currentStoreData).some((rec) =>
    Object.values(rec || {}).some((val) => val === "P" || val === "A" || val === "H")
  );

  return (
    <div>
      <RoleBanner role={role} userName={userName} />
      <div className="ph"><h1>Attendance Management</h1><p>Subject-wise monthly attendance · Sundays auto-excluded · Stored in database</p></div>

      <div className="notif notif-warn" style={{ marginBottom: 16 }}>
        <span className="notif-ico">⚠️</span>
        <div><strong>Reminder:</strong> Students with attendance below 75% are not eligible for end-semester examinations. Mark attendance accurately.</div>
      </div>

      <div className="stats">
        <Stat label="Students (Dept)" value={visibleStudents.length} color="blue" icon="🎓" />
        <Stat label="Present (Day 1)" value={visibleStudents.filter(student => getRecord(student.id)[workingDays[0]] === "P").length} color="green" icon="✅" />
        <Stat label="Absent (Day 1)" value={visibleStudents.filter(student => getRecord(student.id)[workingDays[0]] === "A").length} color="red" icon="❌" />
        <Stat label="Overall %" value={totalSlots > 0 ? `${Math.round((totalPresent / totalSlots) * 100)}%` : "—"} color="teal" icon="📊" />
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <select value={selDept} onChange={e => handleDeptChange(e.target.value)} style={{ width: 110 }}>
          {deptOptions.map(deptId => <option key={deptId}>{deptId}</option>)}
        </select>
        <select value={selSubject} onChange={e => setSelSubject(e.target.value)} style={{ width: 180 }}>
          {subjects.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={selMonth} onChange={e => setSelMonth(e.target.value)} style={{ width: 160 }}>
          {ALL_MONTHS.map(m => <option key={m} value={m}>{m}{m === CURRENT_MONTH ? " ★ (Current)" : ""}</option>)}
          {/* Future months shown as disabled for visibility only */}
          {[1, 2, 3].map(offset => {
            const now = new Date();
            const fut = new Date(now.getFullYear(), now.getMonth() + offset, 1);
            const label = `${MONTH_LABELS[fut.getMonth()]} ${fut.getFullYear()} — upcoming`;
            return <option key={label} value="" disabled>{label}</option>;
          })}
        </select>
        {perms.canEdit && (
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(true)}>+ Add Entry</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowBulk(true)}>⚡ Bulk Mark</button>
          </>
        )}
      </div>

      {/* Legend — styled like reference with colored squares */}
      <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 12, color: "var(--text2)", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: "rgba(26,188,156,0.4)", border: "1px solid rgba(26,188,156,0.6)" }}></span>
          <strong>P</strong> = Present
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: "rgba(224,85,85,0.4)", border: "1px solid rgba(224,85,85,0.6)", marginLeft: 4 }}></span>
          <strong>A</strong> = Absent
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: "rgba(201,162,39,0.25)", border: "1px solid rgba(201,162,39,0.4)", marginLeft: 4 }}></span>
          <strong>H</strong> = Holiday
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--text4)" }}>
          <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: "rgba(100,116,139,0.10)", border: "1px solid rgba(100,116,139,0.2)", marginLeft: 4 }}></span>
          ☀ = Sunday (excluded)
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--text4)" }}>
          <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: "#f8fafc", border: "1px solid #e2e8f0", marginLeft: 4 }}></span>
          🔒 = Future date (locked)
        </span>
        {perms.canEdit && <span style={{ fontSize: 11, color: "var(--text3)" }}>Click any cell to cycle P→A→H</span>}
      </div>

      <div className="notif notif-info" style={{ marginBottom: 10 }}>
        <span className="notif-ico">ℹ️</span>
        <span>Viewing: <strong>{selDept}</strong> / <strong>{selSubject}</strong> / <strong>{selMonth}</strong> — {visibleStudents.length} students · {workingDays.length} working days · {allDays.length - workingDays.length} Sundays excluded</span>
      </div>
      {!sheetLoading && !hasSavedAttendance && (
        <div className="notif notif-warn" style={{ marginBottom: 10 }}>
          <span className="notif-ico">🗂️</span>
          <span>No attendance rows are saved yet for this sheet. The report page only shows data that is stored in the database.</span>
        </div>
      )}

      {/* MAIN ATTENDANCE GRID */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">📅 {selDept} — {selSubject} — {selMonth}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11, color: "var(--text2)" }}>
            <span className="badge b-blue">{visibleStudents.length} students</span>
            <span className="badge b-gray">{workingDays.length} working days</span>
            <span className="badge b-red">{allDays.length - workingDays.length} Sundays</span>
            {perms.canEdit && <span style={{ fontSize: 11, color: "var(--text3)" }}>Click a cell to toggle Present / Absent / Holiday</span>}
          </div>
        </div>

        {sheetLoading ? (
          <div className="empty"><div className="empty-ico">⏳</div><p>Loading attendance sheet…</p></div>
        ) : visibleStudents.length === 0 ? (
          <div className="empty"><div className="empty-ico">📋</div><p>No attendance entries found for {selDept}. Use <strong>+ Add Entry</strong> to add a student to this sheet.</p></div>
        ) : (
          /* ── SINGLE TABLE with sticky first column — rows can never misalign ── */
          <div style={{ overflowX: "auto", padding: "12px 16px" }}>
            <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", tableLayout: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
              <thead>
                <tr>
                  {/* Sticky name column header */}
                  <th style={{
                    position: "sticky", left: 0, zIndex: 3,
                    background: "var(--bg2)",
                    textAlign: "left", padding: "8px 14px",
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text3)",
                    borderBottom: "1px solid var(--border)", borderRight: "2px solid var(--border-md)",
                    minWidth: 220, width: 220, whiteSpace: "nowrap",
                  }}>Student</th>
                  {/* Day columns */}
                  {allDays.map(d => {
                    const sun = isSunday(selMonth, d);
                    const future = isFutureDate(selMonth, d);
                    return (
                      <th key={d} style={{
                        width: 36, minWidth: 36, maxWidth: 36,
                        padding: "6px 2px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
                        textAlign: "center", whiteSpace: "nowrap",
                        background: sun ? "rgba(220,38,38,0.06)" : future ? "#fafbfc" : "var(--bg2)",
                        color: sun ? "var(--red)" : future ? "#cbd5e1" : "var(--text3)",
                        borderBottom: "1px solid var(--border)",
                        opacity: future ? 0.6 : 1,
                      }}>
                        {d}
                        {sun && <div style={{ fontSize: 7, lineHeight: 1 }}>☀</div>}
                        {future && <div style={{ fontSize: 7, lineHeight: 1 }}>🔒</div>}
                      </th>
                    );
                  })}
                  <th style={{ width: 44, minWidth: 44, padding: "6px 4px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center", background: "var(--bg2)", borderBottom: "1px solid var(--border)", color: "var(--text3)" }}>%</th>
                  <th style={{ width: 64, minWidth: 64, padding: "6px 6px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center", background: "var(--bg2)", borderBottom: "1px solid var(--border)", color: "var(--text3)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((s, rowIdx) => {
                  const sid = s.id;
                  const rec = getRecord(sid);
                  const countedDays = markedAttendanceDays(rec);
                  const presentCount = countedDays.filter((d) => rec[d] === "P").length;
                  const pct = countedDays.length ? Math.round((presentCount / countedDays.length) * 100) : null;
                  const isLast = rowIdx === visibleStudents.length - 1;
                  return (
                    <tr key={sid} style={{}} onMouseEnter={e => { e.currentTarget.style.background = "var(--bg2)" }} onMouseLeave={e => { e.currentTarget.style.background = "" }}>
                      {/* Sticky name cell — same row, guaranteed alignment */}
                      <td style={{
                        position: "sticky", left: 0, zIndex: 2,
                        background: "var(--bg1)",
                        padding: "8px 14px", fontSize: 12, fontWeight: 600,
                        borderBottom: isLast ? "none" : "1px solid var(--border)",
                        borderRight: "2px solid var(--border-md)",
                        minWidth: 220, width: 220,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                          <div>
                            <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{s?.name || s.id}</div>
                            <div style={{ fontSize: 9, color: "var(--text3)", fontWeight: 400 }}>{s.id}</div>
                          </div>
                          {perms.canDelete && (
                            <button
                              className="act act-del"
                              style={{ padding: "2px 6px", fontSize: 9, flexShrink: 0 }}
                              onClick={async () => {
                                if (!window.confirm(`Remove ${s.name} from this attendance sheet?`)) return;
                                try {
                                  await attendanceApi.deleteStudent(s.id, {
                                    dept: selDept,
                                    month: selMonth,
                                    year: attendanceYear,
                                    subject: selSubject,
                                  });
                                  setHiddenMap(prev => {
                                    const prevSet = prev[storeKey] ? new Set(prev[storeKey]) : new Set();
                                    prevSet.add(s.id);
                                    return { ...prev, [storeKey]: prevSet };
                                  });
                                  const existing = attData[storeKey] || {};
                                  const updated = { ...existing };
                                  delete updated[s.id];
                                  updateAtt({ ...attData, [storeKey]: updated });
                                  toast(`${s.name} removed from attendance`, "ok");
                                } catch (err) {
                                  toast(`Could not remove attendance: ${err.message}`, "err");
                                }
                              }}
                            >✕</button>
                          )}
                        </div>
                      </td>
                      {/* Day cells — in the SAME <tr> so height always matches */}
                      {allDays.map(d => {
                        const sun = isSunday(selMonth, d);
                        const future = isFutureDate(selMonth, d);
                        const val = sun ? "SUN" : future ? "FUTURE" : (rec[d] || "");
                        const cssClass = getCellClass(val);
                        return (
                          <td key={d} style={{
                            width: 36, minWidth: 36, maxWidth: 36,
                            textAlign: "center", padding: "5px 3px", verticalAlign: "middle",
                            background: sun ? "rgba(220,38,38,0.04)" : future ? "#fafbfc" : "transparent",
                            borderBottom: isLast ? "none" : "1px solid var(--border)",
                            opacity: future ? 0.5 : 1,
                          }}>
                            <div
                              className={`att-day ${cssClass}`}
                              onClick={() => toggle(sid, d)}
                              title={sun ? `Day ${d} — Sunday` : future ? `Day ${d} — future date, not yet markable` : `Day ${d}: ${val || "Unmarked"} — click to change`}
                            >{sun ? "☀" : future ? "–" : (val || "—")}</div>
                          </td>
                        );
                      })}
                      <td style={{ textAlign: "center", padding: "0 4px", fontWeight: 700, fontSize: 11, width: 44, minWidth: 44, borderBottom: isLast ? "none" : "1px solid var(--border)", color: pct == null ? "var(--text3)" : pct < 75 ? "var(--red)" : pct < 85 ? "var(--gold)" : "var(--teal)" }}>
                        {pct == null ? "—" : `${pct}%`}
                      </td>
                      <td style={{ textAlign: "center", padding: "0 4px", width: 64, minWidth: 64, borderBottom: isLast ? "none" : "1px solid var(--border)" }}>
                        {pct == null
                          ? <span className="badge b-gray" style={{ fontSize: 9 }}>Empty</span>
                          : pct < 75
                            ? <span className="badge b-red" style={{ fontSize: 9 }}>Short</span>
                            : <span className="badge b-green" style={{ fontSize: 9 }}>OK</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showBulk && (
        <Modal title="⚡ Bulk Mark Attendance" onClose={() => setShowBulk(false)} footer={<button className="btn btn-secondary" onClick={() => setShowBulk(false)}>Cancel</button>}>
          <p style={{ fontSize: 13, marginBottom: 16 }}>Mark all students for <strong>{selSubject}</strong> — <strong>{selMonth}</strong> (working days only):</p>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-primary" style={{ flex: 1, background: "var(--green)" }} onClick={() => markAll("P")}>✅ All Present</button>
            <button className="btn btn-primary" style={{ flex: 1, background: "var(--red)" }} onClick={() => markAll("A")}>❌ All Absent</button>
          </div>
        </Modal>
      )}

      {showAdd && (
        <Modal title="+ Override / Add Attendance Entry" onClose={() => setShowAdd(false)} footer={<><button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={saveEntry}>Save Entry</button></>}>
          <div className="notif notif-info" style={{ marginBottom: 14 }}><span className="notif-ico">ℹ️</span><span>Override a specific day's entry, or add a student from another dept. Sundays cannot be marked.</span></div>
          <div className="fg">
            <FormField label="Student" name="studentId" type="select" value={addForm.studentId} onChange={e => setAddForm({ ...addForm, studentId: e.target.value })} opts={[{ v: "", l: "— Select —" }, ...students.map(s => ({ v: s.id, l: `${s.name} (${s.dept})` }))]} full />
            <FormField label="Day (1–31)" name="day" type="number" value={addForm.day} onChange={e => setAddForm({ ...addForm, day: e.target.value })} />
            <FormField label="Status" name="status" type="select" value={addForm.status} onChange={e => setAddForm({ ...addForm, status: e.target.value })} opts={["P", "A", "H"]} />
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── FEES (STUDENT-WISE) ────────────────────────────────────────────────────
const Fees = ({ fees, setFees, students, setStudents, depts: liveDepts, role, userName }) => {
  const perms = PERMS[role];
  const deptOptions = resolveDeptIds(liveDepts, ["HUM"], "Academic");
  const getSavedFeeCollections = (student = {}) =>
    (student?.fee_collections && typeof student.fee_collections === "object") ? student.fee_collections : {};
  // Build studentFees from the real students array so the two sections stay in sync
  const studentFees = students.map(s => {
    // DB columns are "paid"/"balance"/"due_date"; frontend may also use
    // "fees_paid"/"fees_due"/"fee_due_date" after a local save — support both.
    const paidAmt = Number(s.fees_paid ?? s.paid) || 0;
    const componentValues = feeFieldsFromStudent(s);
    const total = positiveFeeTotal(componentValues);
    // Prefer stored balance; if 0 or missing, recalculate from total - paid
    const storedBal = Number(s.fees_due ?? s.balance) || 0;
    const balance = total > 0 ? Math.max(0, total - paidAmt) : storedBal;
    return {
      studentId: s.id,
      name: s.name,
      dept: s.dept,
      year: s.year,
      status: s.fee_status || "Pending",
      paid: paidAmt,
      balance,
      dueDate: s.fee_due_date || s.due_date || "2025-07-31",
      lastPayment: s.last_payment || "—",
      ...componentValues,
    };
  });

  // Helper: update a student's fee fields in the shared students state + backend
  const updateStudentFeeStatus = async (studentId, newStatus, paid, due, silent = false) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const demandValues = feeFieldsFromStudent(student);
    const updated = {
      ...student,
      fee_status: newStatus,
      fees_paid: paid,
      fees_due: due,
      fee_due_date: student.fee_due_date || student.due_date || "2025-07-31",
      fee_collections: newStatus === "Paid" ? feePayloadFields(demandValues) : getSavedFeeCollections(student),
    };
    try {
      await studentsApi.update(studentId, updated);
      const feesRes = await feesApi.list();
      setStudents(prev => prev.map(s => s.id === studentId ? updated : s));
      if (Array.isArray(feesRes?.fees)) setFees(feesRes.fees);
      if (!silent) toast(`Fee status → ${newStatus} · Paid ₹${Number(paid).toLocaleString()} · Due ₹${Number(due).toLocaleString()}`, "ok");
    } catch (err) {
      if (!silent) toast(`Could not save fee status: ${err.message}`, "err");
    }
  };

  const [tab, setTab] = useState("students");
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [viewFee, setViewFee] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [feeForm, setFeeForm] = useState({});
  const [feeAssigned, setFeeAssigned] = useState({});
  // changeFeeForm — component inputs are collected amounts, totals are derived
  const changeFeeForm = (e) => {
    const { name, value } = e.target;
    setFeeForm(prev => ({ ...prev, [name]: value }));
    if (FEE_COMPONENTS.some(c => c.key === name) && feeNumber(value) > 0) {
      setFeeAssigned(prev => ({ ...prev, [name]: true }));
    }
  };


  // ── Fee Standards (editable legend) ──────────────────────────────────────
  const [feeStandards, setFeeStandards] = useState(() => feeStandardsFromFees(fees));
  const [showStdEditor, setShowStdEditor] = useState(false);
  const [stdDraft, setStdDraft] = useState({});
  useEffect(() => {
    setFeeStandards(feeStandardsFromFees(fees));
  }, [fees]);
  const openStdEditor = () => { setStdDraft({ ...feeStandards }); setShowStdEditor(true); };
  const saveStdEditor = async () => {
    const parsed = Object.fromEntries(FEE_COMPONENTS.map(({ key }) => [key, Math.max(0, parseInt(stdDraft[key]) || 0)]));
    try {
      await Promise.all(
        FEE_COMPONENTS.map(async ({ key, type }) => {
          const row = fees.find(f => f.type === type);
          if (!row) return;
          await feesApi.update(row.id, {
            id: row.id,
            type: row.type,
            amount: parsed[key],
            freq: row.freq,
            due_date: row.due_date,
            collected: feeNumber(row.collected),
            pending: feeNumber(row.pending),
          });
        }),
      );
      const feesRes = await feesApi.list();
      if (Array.isArray(feesRes?.fees)) setFees(feesRes.fees);
      setFeeStandards(parsed);
      setShowStdEditor(false);
      toast("Fee standards updated ✓", "ok");
    } catch (err) {
      toast(`Could not update standards: ${err.message}`, "err");
    }
  };
  const applyStandardRates = (onlyMissing = false) => {
    setFeeAssigned(prev => Object.fromEntries(FEE_COMPONENTS.map(({ key }) => [key, onlyMissing ? (prev[key] || feeNumber(feeForm[key]) > 0) : true])));
  };
  const clearFeeComponents = () => {
    setFeeForm(prev => ({ ...prev, ...feeFormDefaults(), paid: "0", balance: "0" }));
    setFeeAssigned(Object.fromEntries(FEE_COMPONENTS.map(({ key }) => [key, false])));
  };
  const activateFeeHead = (key) => {
    setFeeAssigned(prev => ({ ...prev, [key]: true }));
  };
  const clearFeeHead = (key) => {
    setFeeAssigned(prev => ({ ...prev, [key]: false }));
    setFeeForm(prev => ({ ...prev, [key]: "0" }));
  };
  const setCollectedToDemand = () => {
    setFeeForm(prev => ({
      ...prev,
      ...Object.fromEntries(FEE_COMPONENTS.map(({ key }) => [key, feeAssigned[key] ? String(feeNumber(feeStandards[key])) : String(feeNumber(prev[key]))])),
    }));
  };

  const tAmt = fees.reduce((a, f) => a + (Number(f.amount) || 0), 0);
  const tCol = fees.reduce((a, f) => a + (Number(f.collected) || 0), 0);
  const tPen = fees.reduce((a, f) => a + (Number(f.pending) || 0), 0);

  const filteredStudentFees = studentFees.filter(f =>
    (filterDept === "All" || f.dept === filterDept) &&
    (filterStatus === "All" || f.status === filterStatus) &&
    ((f.name || "").toLowerCase().includes(search.toLowerCase()) || (f.studentId || "").toLowerCase().includes(search.toLowerCase()))
  );

  const openEditFee = (f) => {
    // Pull the real student record so we can pre-fill all fee breakdown fields
    const stu = students.find(s => s.id === f.studentId) || {};
    const savedCollections = getSavedFeeCollections(stu);
    const componentFields = collectionFieldsFromStudent(stu, savedCollections);
    const assignedHeads = {
      ...studentAssignedFeeHeads(stu),
      ...Object.fromEntries(FEE_COMPONENTS.map(component => [component.key, savedCollectionAmount(savedCollections, component) > 0 ? true : undefined])),
    };
    setFeeForm({
      studentId: f.studentId,
      name: f.name,
      dept: f.dept,
      year: String(f.year),
      ...componentFields,
      paid: String(feeCollectionTotal(componentFields)),
      balance: String(feeOutstandingTotal(assignedHeads, componentFields, feeStandards)),
      status: f.status,
      dueDate: stu.fee_due_date || stu.due_date || "2025-07-31",
      lastPayment: stu.last_payment || "",
    });
    setFeeAssigned(Object.fromEntries(FEE_COMPONENTS.map(({ key }) => [key, Boolean(assignedHeads[key])])));
    setEditModal("edit");
  };

  const saveFee = async () => {
    if (!feeForm.studentId) { toast("Please select a student", "err"); return; }
    const componentValues = Object.fromEntries(FEE_COMPONENTS.map(({ key }) => [key, Math.max(0, parseInt(feeForm[key]) || 0)]));
    const assignedHeads = Object.fromEntries(FEE_COMPONENTS.map(({ key }) => [key, Boolean(feeAssigned[key] || componentValues[key] > 0)]));
    const total = feeDemandTotal(assignedHeads, feeStandards);
    if (total <= 0) { toast("Activate at least one fee head", "err"); return; }
    const paid = feeCollectionTotal(componentValues);
    const balance = feeOutstandingTotal(assignedHeads, componentValues, feeStandards);
    const advance = feeAdvanceTotal(assignedHeads, componentValues, feeStandards);
    const today = new Date().toISOString().split("T")[0];
    // Paid = paid >= total (even if only tuition was filled)
    const status = (balance <= 0 && total > 0) ? "Paid"
      : (feeForm.dueDate && feeForm.dueDate < today) ? "Overdue"
        : "Pending";
    // Persist to backend + update shared students state (both add & edit)
    // Build the full student update with all fee breakdown fields
    const stu = students.find(s => s.id === feeForm.studentId);
    if (stu) {
      const demandValues = Object.fromEntries(FEE_COMPONENTS.map(({ key }) => [key, assignedHeads[key] ? feeNumber(feeStandards[key]) : 0]));
      const updated = {
        ...stu,
        fee_status: status,
        fees_paid: paid,
        fees_due: balance,
        fee_due_date: feeForm.dueDate || "2025-07-31",
        ...feePayloadFields(demandValues),
        fee_collections: feePayloadFields(componentValues),
      };
      try {
        await studentsApi.update(feeForm.studentId, updated);
        const feesRes = await feesApi.list();
        setStudents(prev => prev.map(s => s.id === feeForm.studentId ? updated : s));
        if (Array.isArray(feesRes?.fees)) setFees(feesRes.fees);
        toast(`Fee saved · Demand ₹${total.toLocaleString()} · Paid ₹${paid.toLocaleString()} · Due ₹${balance.toLocaleString()}${advance ? ` · Advance ₹${advance.toLocaleString()}` : ""}`, "ok");
        setEditModal(null);
      } catch (err) {
        toast(`Could not save fee record: ${err.message}`, "err");
      }
    }
  };


  return (
    <div>
      <RoleBanner role={role} userName={userName} />
      <div className="ph"><h1>Fee Management</h1><p>Student-wise fee records, payment tracking and fee structure — AY 2025–26</p></div>
      <div className="stats">
        <Stat label="Total Students" value={students.length} color="blue" icon="👥" />
        <Stat label="Fully Paid" value={students.filter(s => s.fee_status === "Paid").length} color="green" icon="✅" />
        <Stat label="Pending / Overdue" value={students.filter(s => s.fee_status !== "Paid").length} color="red" icon="⏳" />
        <Stat label="Fee Recovery" value={tAmt > 0 ? `${Math.round((tCol / tAmt) * 100)}%` : "—"} color="teal" icon="📊" />
      </div>

      <div className="tabs">
        <div className={`tab${tab === "students" ? " on" : ""}`} onClick={() => setTab("students")}>👥 Student-wise Fee Details</div>

      </div>

      {tab === "students" && (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
            <input placeholder="🔍 Search by name or ID…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ width: 100 }}>
              {["All", ...deptOptions].map(d => <option key={d}>{d}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 120 }}>
              {["All", "Paid", "Pending", "Overdue"].map(s => <option key={s}>{s}</option>)}
            </select>
            {perms.canAdd && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const firstStudent = students[0] || {};
                  const savedCollections = getSavedFeeCollections(firstStudent);
                  const initialCollections = firstStudent.id ? collectionFieldsFromStudent(firstStudent, savedCollections) : feeFormDefaults();
                  const initialAssigned = firstStudent.id ? {
                    ...studentAssignedFeeHeads(firstStudent),
                    ...Object.fromEntries(FEE_COMPONENTS.map(component => [component.key, savedCollectionAmount(savedCollections, component) > 0 || studentAssignedFeeHeads(firstStudent)[component.key]])),
                  } : Object.fromEntries(FEE_COMPONENTS.map(({ key }) => [key, false]));
                  setFeeForm({
                    studentId: firstStudent.id || "",
                    name: firstStudent.name || "",
                    dept: firstStudent.dept || "CSE",
                    year: String(firstStudent.year || 1),
                    ...initialCollections,
                    paid: String(feeCollectionTotal(initialCollections)),
                    balance: String(feeOutstandingTotal(initialAssigned, initialCollections, feeStandards)),
                    status: firstStudent.fee_status || "Pending",
                    dueDate: firstStudent.fee_due_date || firstStudent.due_date || "2025-07-31",
                    lastPayment: firstStudent.last_payment || ""
                  });
                  setFeeAssigned(initialAssigned);
                  setEditModal("add");
                }}
              >
                + Add Student Fee
              </button>
            )}
          </div>
          <div className="card">
            <div className="card-head">
              <div className="card-title">💰 Student Fee Details — {filteredStudentFees.length} records</div>
              <div style={{ display: "flex", gap: 8 }}>
                <span className="badge b-green">{students.filter(s => s.fee_status === "Paid").length} Paid</span>
                <span className="badge b-gold">{students.filter(s => s.fee_status === "Pending").length} Pending</span>
                <span className="badge b-red">{students.filter(s => s.fee_status === "Overdue").length} Overdue</span>
              </div>
            </div>
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th><th>Name</th><th>Dept / Year</th>
                    {FEE_COMPONENTS.map(({ key, label }) => <th key={key}>{label} (₹)</th>)}
                    <th>Total (₹)</th><th>Paid (₹)</th><th>Balance (₹)</th>
                    <th>Due Date</th><th>Status</th><th>Actions</th>
                  </tr>
                  {/* ── Standard Amount Legend Row ── */}
                  <tr style={{ background: "linear-gradient(90deg,rgba(37,99,235,0.06),rgba(37,99,235,0.03))" }}>
                    <td colSpan={3} style={{ padding: "4px 8px", fontSize: 10, fontWeight: 700, color: "var(--blue)", letterSpacing: 0.5, whiteSpace: "nowrap", borderBottom: "2px solid rgba(37,99,235,0.15)" }}>
                      📌 Standard Rates →
                    </td>
                    {FEE_COMPONENTS.map(({ key }) => (
                      <td key={key} style={{
                        padding: "3px 8px", fontSize: 11, fontWeight: 700,
                        color: "var(--blue)", background: "rgba(37,99,235,0.05)",
                        borderBottom: "2px solid rgba(37,99,235,0.15)",
                        whiteSpace: "nowrap", textAlign: "right",
                      }}>
                        ₹{(feeStandards[key] || 0).toLocaleString()}
                      </td>
                    ))}
                    {/* Total standard */}
                    <td style={{ padding: "3px 8px", fontSize: 11, fontWeight: 800, color: "var(--blue)", background: "rgba(37,99,235,0.08)", borderBottom: "2px solid rgba(37,99,235,0.2)", whiteSpace: "nowrap", textAlign: "right" }}>
                      ₹{feeStandardTotal(feeStandards).toLocaleString()}
                    </td>
                    <td colSpan={5} style={{ padding: "3px 8px", borderBottom: "2px solid rgba(37,99,235,0.15)" }}>
                      {perms.canEdit && (
                        <button onClick={openStdEditor} style={{ fontSize: 10, padding: "2px 8px", background: "var(--blue)", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}>
                          ✏️ Edit Rates
                        </button>
                      )}
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudentFees.map(f => {
                    const total = positiveFeeTotal(f) || (f.paid + f.balance);
                    const feeCell = (v) => <td style={{ color: v > 0 ? "var(--text1)" : "var(--text4)" }}>{v > 0 ? (v || 0).toLocaleString() : "—"}</td>;
                    return (
                      <tr key={f.studentId}>
                        <td><span className="mono">{f.studentId}</span></td>
                        <td className="fw6">{f.name}</td>
                        <td><span className="badge b-blue">{f.dept}</span> <span className="fc3 fs11">Yr {f.year}</span></td>
                        {FEE_COMPONENTS.map(({ key }) => feeCell(f[key] || 0))}
                        <td className="fw7">{total.toLocaleString()}</td>
                        <td className="fee-status-paid" style={{ color: "var(--green)", fontWeight: 600 }}>{(f.paid || 0).toLocaleString()}</td>
                        <td style={{ color: f.balance > 0 ? "var(--red)" : "var(--green)", fontWeight: 700 }}>{f.balance > 0 ? (f.balance || 0).toLocaleString() : "Nil"}</td>
                        <td className="fc3 fs11">{f.dueDate || "—"}</td>
                        <td><span className={`badge ${f.status === "Paid" ? "b-green" : f.status === "Pending" ? "b-gold" : "b-red"}`}>{f.status}</span></td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="act act-view" onClick={() => setViewFee(f)}>View</button>
                            {perms.canEdit && f.balance > 0 && <button className="act act-add" onClick={() => updateStudentFeeStatus(f.studentId, "Paid", total, 0)}>Pay Full</button>}
                            {perms.canEdit && <button className="act act-edit" onClick={() => openEditFee(f)}>Edit</button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!filteredStudentFees.length && <div className="empty"><div className="empty-ico">💰</div><p>No fee records match your filters</p></div>}
            </div>
          </div>
        </>
      )}

      {viewFee && (
        <Modal title={`Fee Details — ${viewFee.name}`} onClose={() => setViewFee(null)} footer={<button className="btn btn-secondary" onClick={() => setViewFee(null)}>Close</button>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[["Student ID", viewFee.studentId], ["Department", viewFee.dept], ["Year", `Year ${viewFee.year}`], ["Status", viewFee.status], ["Due Date", viewFee.dueDate], ["Last Payment", viewFee.lastPayment]].map(([k, v]) => (
              <div key={k} style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}><div className="fc3 fs11 mb-4">{k}</div><div className="fw7" style={{ fontSize: 13 }}>{v}</div></div>
            ))}
          </div>
          <div style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", background: "var(--bg3)", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 12 }}>Ledger Breakdown</div>
            {FEE_COMPONENTS.map(({ key, label }) => {
              const v = viewFee[key] || 0;
              return (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <span className="fc2">{label} Fee</span>
                  <span style={{ fontWeight: 600, color: v > 0 ? "var(--text1)" : "var(--text4)" }}>₹{v.toLocaleString()}</span>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 800 }}><span>Fee Demand (Dr)</span><span>₹{(positiveFeeTotal(viewFee) || (viewFee.paid + viewFee.balance)).toLocaleString()}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: 13 }}><span className="fc2">Collection (Cr)</span><span style={{ color: "var(--green)", fontWeight: 700 }}>₹{viewFee.paid.toLocaleString()}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: 13 }}><span className="fc2">Outstanding</span><span style={{ color: viewFee.balance > 0 ? "var(--red)" : "var(--green)", fontWeight: 700 }}>{viewFee.balance > 0 ? `₹${viewFee.balance.toLocaleString()}` : "Nil"}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", fontSize: 13 }}><span className="fc2">Advance Credit</span><span style={{ color: viewFee.paid > (positiveFeeTotal(viewFee) || (viewFee.paid + viewFee.balance)) ? "var(--gold)" : "var(--text3)", fontWeight: 700 }}>{viewFee.paid > (positiveFeeTotal(viewFee) || (viewFee.paid + viewFee.balance)) ? `₹${(viewFee.paid - (positiveFeeTotal(viewFee) || (viewFee.paid + viewFee.balance))).toLocaleString()}` : "Nil"}</span></div>
          </div>
        </Modal>
      )}

      {editModal && (() => {
        // Live calculated values shown inside the modal
        const _collections = Object.fromEntries(FEE_COMPONENTS.map(({ key }) => [key, Math.max(0, parseInt(feeForm[key]) || 0)]));
        const _assigned = Object.fromEntries(FEE_COMPONENTS.map(({ key }) => [key, Boolean(feeAssigned[key] || _collections[key] > 0)]));
        const _total = feeDemandTotal(_assigned, feeStandards);
        const _paid = feeCollectionTotal(_collections);
        const _balance = feeOutstandingTotal(_assigned, _collections, feeStandards);
        const _advance = feeAdvanceTotal(_assigned, _collections, feeStandards);
        const _ledgerRows = feeHeadLedgerRows(_assigned, _collections, feeStandards);
        const _today = new Date().toISOString().split("T")[0];
        const _status = (_total > 0 && _balance <= 0) ? "Paid"
          : (feeForm.dueDate && feeForm.dueDate < _today) ? "Overdue"
            : "Pending";
        const _statusColor = _status === "Paid" ? "var(--green)" : _status === "Overdue" ? "var(--red)" : "var(--gold)";

        return (
          <Modal
            title={editModal === "add" ? "➕ Add Student Fee Record" : "✏️ Edit Student Fee Record"}
            onClose={() => setEditModal(null)}
            footer={
              <>
                <button className="btn btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveFee}>
                  {editModal === "add" ? "Add Fee Record" : "Save Changes"}
                </button>
              </>
            }
          >
            {/* Student selector (Add mode) or read-only header (Edit mode) */}
            {editModal === "add" ? (
              <div className="fgrp fg-full" style={{ marginBottom: 16 }}>
                <label>Select Student *</label>
                <select
                  name="studentId"
                  value={feeForm.studentId}
                  onChange={e => {
                    const stu = students.find(s => s.id === e.target.value);
                    if (stu) {
                      const savedCollections = getSavedFeeCollections(stu);
                      const nextCollections = collectionFieldsFromStudent(stu, savedCollections);
                      const studentAssigned = studentAssignedFeeHeads(stu);
                      const nextAssigned = {
                        ...studentAssigned,
                        ...Object.fromEntries(FEE_COMPONENTS.map(component => [component.key, savedCollectionAmount(savedCollections, component) > 0 || studentAssigned[component.key]])),
                      };
                      setFeeForm(prev => ({
                        ...prev,
                        studentId: stu.id,
                        name: stu.name,
                        dept: stu.dept,
                        year: String(stu.year),
                        ...nextCollections,
                        paid: String(feeCollectionTotal(nextCollections)),
                        balance: String(feeOutstandingTotal(nextAssigned, nextCollections, feeStandards)),
                        status: stu.fee_status || "Pending",
                        dueDate: stu.fee_due_date || stu.due_date || "2025-07-31",
                      }));
                      setFeeAssigned(nextAssigned);
                    } else {
                      setFeeForm(prev => ({ ...prev, studentId: e.target.value, name: "", dept: "", year: "" }));
                      setFeeAssigned(Object.fromEntries(FEE_COMPONENTS.map(({ key }) => [key, false])));
                    }
                  }}
                >
                  <option value="">— Select a student —</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.id} — {s.name} ({s.dept}, Yr {s.year})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--bg2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {(feeForm.name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{feeForm.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{feeForm.studentId} · {feeForm.dept} · Year {feeForm.year}</div>
                </div>
              </div>
            )}

            {/* Fee breakdown inputs */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 700, fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1 }}>Fee Head Collections</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button type="button" className="act act-edit" onClick={() => applyStandardRates(false)}>Assign All Heads</button>
                <button type="button" className="act act-view" onClick={() => applyStandardRates(true)}>Assign Used Heads</button>
                <button type="button" className="act act-del" onClick={clearFeeComponents}>Clear</button>
              </div>
            </div>
            <div className="fg" style={{ marginBottom: 16 }}>
              {FEE_COMPONENTS.map(({ key, label }) => (
                <div key={key} className="fgrp">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                    <label>{label} Collection (₹)</label>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                      <span className="badge b-blue" style={{ fontSize: 10 }}>Std ₹{feeNumber(feeStandards[key]).toLocaleString()}</span>
                      {_assigned[key]
                        ? <button type="button" className="act act-del" style={{ padding: "2px 7px", fontSize: 10 }} onClick={() => clearFeeHead(key)}>Remove</button>
                        : <button type="button" className="act act-view" style={{ padding: "2px 7px", fontSize: 10 }} onClick={() => activateFeeHead(key)}>Use</button>}
                    </div>
                  </div>
                  <input type="number" name={key} value={feeForm[key] !== undefined && feeForm[key] !== null ? String(feeForm[key]) : "0"} onChange={changeFeeForm} />
                </div>
              ))}
            </div>

            {/* Payment details */}
            <div style={{ fontWeight: 700, fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Payment Details</div>
            <div className="fg" style={{ marginBottom: 16 }}>
              <div className="fgrp">
                <label>Total Paid / Collection (₹)</label>
                <input type="number" value={String(_paid)} readOnly style={{ color: "var(--green)", fontWeight: 800, background: "var(--bg2)" }} />
              </div>
              <div className="fgrp">
                <label>Outstanding Auto (₹)</label>
                <input type="number" value={String(_balance)} readOnly style={{ color: _balance > 0 ? "var(--red)" : "var(--green)", fontWeight: 800, background: "var(--bg2)" }} />
              </div>
              <FormField label="Due Date" name="dueDate" type="date" value={feeForm.dueDate} onChange={changeFeeForm} />
            </div>
            <div style={{ display: "flex", gap: 6, margin: "-6px 0 16px", flexWrap: "wrap" }}>
              <button type="button" className="act act-add" onClick={setCollectedToDemand}>Collect Full Assigned Heads</button>
            </div>

            {/* Live auto-calculated summary */}
            {_ledgerRows.length > 0 && (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: 16 }}>
                <div style={{ padding: "9px 14px", background: "var(--bg3)", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 12 }}>Payment Allocation</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th>Fee Head</th>
                        <th>Standard Demand</th>
                        <th>Collected</th>
                        <th>Outstanding</th>
                      </tr>
                    </thead>
                    <tbody>
                      {_ledgerRows.map(row => (
                        <tr key={row.key}>
                          <td className="fw6">{row.label}</td>
                          <td>₹{row.demand.toLocaleString()}</td>
                          <td style={{ color: "var(--green)", fontWeight: 700 }}>₹{row.collected.toLocaleString()}</td>
                          <td style={{ color: row.outstanding > 0 ? "var(--red)" : "var(--green)", fontWeight: 800 }}>{row.outstanding > 0 ? `₹${row.outstanding.toLocaleString()}` : "Nil"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Live auto-calculated summary */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
              <div style={{ padding: "9px 14px", background: "var(--bg3)", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                🧮 Ledger Summary
              </div>
              {[
                ["Fee Demand (Dr)", `₹${_total.toLocaleString()}`, "var(--text1)"],
                ["Collection (Cr)", `₹${_paid.toLocaleString()}`, "var(--green)"],
                ["Outstanding", _balance > 0 ? `₹${_balance.toLocaleString()}` : "Nil", _balance > 0 ? "var(--red)" : "var(--green)"],
                ["Advance Credit", _advance > 0 ? `₹${_advance.toLocaleString()}` : "Nil", _advance > 0 ? "var(--gold)" : "var(--text3)"],
              ].map(([k, v, c]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <span style={{ color: "var(--text2)" }}>{k}</span>
                  <span style={{ fontWeight: 700, color: c }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", fontSize: 13 }}>
                <span style={{ fontWeight: 700 }}>Fee Status</span>
                <span style={{ fontWeight: 800, fontSize: 12, padding: "3px 10px", borderRadius: 20, border: "1.5px solid", color: _statusColor, background: _status === "Paid" ? "rgba(22,163,74,0.1)" : _status === "Overdue" ? "rgba(220,38,38,0.08)" : "rgba(217,119,6,0.08)", borderColor: _statusColor }}>
                  {_status}
                </span>
              </div>
            </div>
          </Modal>
        );
      })()}


      {/* ── Edit Fee Standards Modal ── */}
      {showStdEditor && (
        <Modal
          title="📌 Edit Standard Fee Rates"
          onClose={() => setShowStdEditor(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowStdEditor(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveStdEditor}>Save Rates</button>
            </>
          }
        >
          <div style={{ marginBottom: 12, padding: "10px 14px", background: "rgba(37,99,235,0.06)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(37,99,235,0.15)", fontSize: 12, color: "var(--blue)" }}>
            💡 These are the <strong>official/standard rates</strong> shown as the legend row under each column header in the Student-wise Fee table. Update them whenever fees are revised.
          </div>
          <div className="fg">
            {FEE_COMPONENTS.map(({ key, label }) => (
              <div key={key} className="fgrp">
                <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text3)" }}>{label} Fee (₹)</label>
                <input
                  type="number"
                  value={stdDraft[key] ?? 0}
                  onChange={e => setStdDraft(p => ({ ...p, [key]: e.target.value }))}
                  style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text1)", outline: "none", width: "100%" }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--bg2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)" }}>Grand Total (All Fees)</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--blue)", fontFamily: "var(--font-mono)" }}>
              ₹{Object.values(stdDraft).reduce((a, v) => a + (parseInt(v) || 0), 0).toLocaleString()}
            </span>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── TRANSPORT ─────────────────────────────────────────────────────────────
const Transport = ({ routes, setRoutes, students, role, userName }) => {
  const perms = PERMS[role];
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [viewR, setViewR] = useState(null);
  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // Derive live student count per route from the students array
  // Only count students whose transport field matches the route name and are Active
  const routeStudentCount = (routeName) =>
    students.filter(s => s.transport === routeName && s.status === "Active").length;

  // Enrich routes with live counts
  const enrichedRoutes = routes.map(r => ({ ...r, students: routeStudentCount(r.name) }));

  const openAdd = () => { setForm({ name: "", area: "", stops: "0", driver: "", contact: "", bus: "", time: "7:30 AM" }); setModal("add"); };
  const openEdit = (r) => { setForm({ ...r, stops: String(r.stops) }); setModal("edit"); };

  const save = async () => {
    // students count is derived — never stored manually on route
    const { students: _ignored, ...rest } = form;
    const payload = { ...rest, stops: parseInt(form.stops) || 0 };
    try {
      if (modal === "add") {
        await transportApi.create(payload);
      } else {
        await transportApi.update(payload.id, payload);
      }
      const res = await transportApi.list();
      setRoutes(Array.isArray(res?.routes) ? res.routes : []);
      toast(modal === "add" ? "Route added" : "Updated", "ok");
      setModal(null);
    } catch (err) {
      toast(err.message || "Failed to save route", "err");
    }
  };

  const totalOnTransport = students.filter(s => s.transport && s.transport !== "Own" && s.status === "Active").length;

  return (
    <div>
      <RoleBanner role={role} userName={userName} />
      <div className="ph"><h1>Transport Management</h1><p>Bus routes, driver assignments and student transport</p></div>
      <div className="stats">
        <Stat label="Active Routes" value={routes.length} color="blue" icon="🗺️" />
        <Stat label="Total Buses" value={routes.length} color="teal" icon="🚌" />
        <Stat label="Students on Transport" value={totalOnTransport} color="green" icon="🎓" />
        <Stat label="Total Stops" value={enrichedRoutes.reduce((a, r) => a + (parseInt(r.stops) || 0), 0)} color="purple" icon="📍" />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        {perms.canAdd && <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Route</button>}
      </div>
      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Route</th><th>Area</th><th>Stops</th><th>Students</th><th>Driver</th><th>Contact</th><th>Bus No.</th><th>Departure</th><th>Actions</th></tr></thead>
            <tbody>
              {enrichedRoutes.map(r => (
                <tr key={r.id}>
                  <td><span className="badge b-blue">{r.name}</span></td>
                  <td style={{ fontSize: 12 }}>{r.area}</td>
                  <td>{r.stops}</td>
                  <td><strong>{r.students}</strong></td>
                  <td className="fw6 fs11">{r.driver}</td>
                  <td className="fc3 fs11">{r.contact}</td>
                  <td><span className="mono">{r.bus}</span></td>
                  <td><span className="badge b-green">{r.time}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="act act-view" onClick={() => setViewR(r)}>View</button>
                      {perms.canEdit && <button className="act act-edit" onClick={() => openEdit(r)}>Edit</button>}
                      {perms.canDelete && <button className="act act-del" onClick={async () => {
                        if (!window.confirm("Delete this route?")) return;
                        try {
                          await transportApi.delete(r.id);
                          const res = await transportApi.list();
                          setRoutes(Array.isArray(res?.routes) ? res.routes : []);
                          toast("Deleted", "ok");
                        } catch (err) { toast(err.message || "Failed to delete route", "err"); }
                      }}>Del</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewR && (
        <Modal title={`🚌 ${viewR.name} Details`} onClose={() => setViewR(null)} footer={<button className="btn btn-secondary" onClick={() => setViewR(null)}>Close</button>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["Route", viewR.name], ["Area", viewR.area], ["Stops", viewR.stops], ["Students (live)", routeStudentCount(viewR.name)], ["Driver", viewR.driver], ["Bus", viewR.bus], ["Departure", viewR.time], ["Contact", viewR.contact]].map(([k, v]) => (
              <div key={k} style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
                <div className="fc3 fs11 mb-4">{k}</div>
                <div className="fw7" style={{ fontSize: 13 }}>{v}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title={`${modal === "add" ? "Add" : "Edit"} Route`} onClose={() => setModal(null)} footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <div className="notif notif-info" style={{ marginBottom: 14 }}>
            <span className="notif-ico">ℹ️</span>
            <span>Student count is automatically derived from the Students module based on who is assigned to this route.</span>
          </div>
          <div className="fg">
            <FormField label="Route Name" name="name" value={form.name} onChange={change} />
            <FormField label="Area Covered" name="area" value={form.area} onChange={change} />
            <FormField label="Number of Stops" name="stops" type="number" value={form.stops} onChange={change} />
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

// ─── CERTIFICATES ──────────────────────────────────────────────────────────
const Certificates = ({ students, role, userName }) => {
  const perms = PERMS[role];
  const [certs, setCerts] = useState(CERTS);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [viewC, setViewC] = useState(null);
  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const openAdd = () => { setForm({ type: "Bonafide Certificate", student: "", status: "Pending", date: new Date().toISOString().split("T")[0] }); setModal("add"); };
  const openEdit = (c) => { setForm({ ...c }); setModal("edit"); };
  const save = () => { if (!form.student?.trim()) { toast("Select a student", "err"); return; } const verif = form.status === "Issued" ? `VER-${new Date().getFullYear()}-${String(certs.length + 1).padStart(3, "0")}` : "—"; if (modal === "add") { setCerts(p => [...p, { ...form, id: `C${String(p.length + 1).padStart(3, "0")}`, verif }]); toast("Certificate issued", "ok"); } else { setCerts(p => p.map(c => c.id === form.id ? { ...form, verif: form.status === "Issued" ? (c.verif !== "—" ? c.verif : verif) : "—" } : c)); toast("Updated", "ok"); } setModal(null); };
  const downloadCert = (cert) => { const content = `VIDYASAGAR DEEMED UNIVERSITY\n${"─".repeat(42)}\n\nCERTIFICATE TYPE : ${cert.type}\nSTUDENT NAME    : ${cert.student}\nISSUE DATE      : ${cert.date}\nVERIFICATION ID : ${cert.verif}\nSTATUS          : ${cert.status}`; const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([content], { type: "text/plain" })); a.download = `${cert.type.replace(/\s+/g, "_")}_${cert.student.replace(/\s+/g, "_")}.txt`; a.click(); toast("Downloaded", "ok"); };
  return (
    <div>
      <RoleBanner role={role} userName={userName} />
      <div className="ph"><h1>Certificates & Documents</h1><p>Issue and manage official certificates and transcripts</p></div>
      <div className="stats"><Stat label="Total Issued" value={certs.filter(c => c.status === "Issued").length} color="blue" icon="📜" /><Stat label="Pending" value={certs.filter(c => c.status === "Pending").length} color="orange" icon="⏳" /><Stat label="Verified" value={certs.filter(c => c.verif !== "—").length} color="green" icon="✅" /><Stat label="Types" value={new Set(certs.map(c => c.type)).size} color="purple" icon="📋" /></div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>{perms.canAdd && <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Issue Certificate</button>}</div>
      <div className="card"><div className="tbl-wrap"><table><thead><tr><th>Cert ID</th><th>Type</th><th>Student</th><th>Date</th><th>Verification ID</th><th>Status</th><th>Actions</th></tr></thead><tbody>{certs.map(c => (<tr key={c.id}><td><span className="mono">{c.id}</span></td><td className="fw6">{c.type}</td><td>{c.student}</td><td className="fc3 fs11">{c.date}</td><td><span className="mono fc3">{c.verif}</span></td><td><span className={`badge ${c.status === "Issued" ? "b-green" : "b-gold"}`}>{c.status}</span></td><td><div style={{ display: "flex", gap: 4 }}><button className="act act-view" onClick={() => setViewC(c)}>View</button>{c.status === "Issued" && <button className="act act-ok" onClick={() => downloadCert(c)}>↓ DL</button>}{perms.canEdit && <button className="act act-edit" onClick={() => openEdit(c)}>Edit</button>}{perms.canDelete && <button className="act act-del" onClick={() => { setCerts(p => p.filter(x => x.id !== c.id)); toast("Deleted", "ok"); }}>Del</button>}</div></td></tr>))}</tbody></table></div></div>
      {viewC && (<Modal title="Certificate Details" onClose={() => setViewC(null)} footer={<><button className="btn btn-secondary" onClick={() => setViewC(null)}>Close</button>{viewC.status === "Issued" && <button className="btn btn-primary" onClick={() => downloadCert(viewC)}>⬇ Download</button>}</>}><div style={{ textAlign: "center", padding: "20px 0", borderBottom: "1px solid var(--border)", marginBottom: 16 }}><div style={{ fontSize: 40, marginBottom: 8 }}>📜</div><div style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 800 }}>{viewC.type}</div><div className="fc3 fs11" style={{ marginTop: 4 }}>Vidyasagar Deemed University</div></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{[["Student", viewC.student], ["Issue Date", viewC.date], ["Verification ID", viewC.verif], ["Status", viewC.status]].map(([k, v]) => (<div key={k} style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}><div className="fc3 fs11 mb-4">{k}</div><div className="fw7" style={{ fontSize: 13 }}>{v}</div></div>))}</div></Modal>)}
      {modal && (<Modal title={modal === "add" ? "Issue Certificate" : "Edit Certificate"} onClose={() => setModal(null)} footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}><div className="fg"><FormField label="Certificate Type" name="type" type="select" value={form.type} onChange={change} opts={["Degree Certificate", "Provisional Certificate", "Bonafide Certificate", "Transcript", "Migration Certificate", "Character Certificate", "Study Certificate"]} full /><FormField label="Student Name" name="student" type="select" value={form.student} onChange={change} opts={["", ...students.map(s => s.name)]} full /><FormField label="Issue Date" name="date" type="date" value={form.date} onChange={change} /><FormField label="Status" name="status" type="select" value={form.status} onChange={change} opts={["Pending", "Issued"]} /></div></Modal>)}
    </div>
  );
};

// ─── PUBLICATIONS ──────────────────────────────────────────────────────────
const Publications = ({ role, userName, staff, setStaff, pubs, setPubs }) => {
  const perms = PERMS[role];
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("All");
  const [viewP, setViewP] = useState(null);
  const [form, setForm] = useState({});
  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const types = ["All", "Journal", "Conference", "Book Chapter", "Patent"];
  const filtered = pubs.filter(p => filter === "All" || p.type === filter);

  // Teaching staff only — these are the ones who can have publications
  const teachingStaff = (staff || []).filter(s => s.type === "Teaching");

  const openAdd = () => {
    setForm({ staff_id: "", author: "", type: "Journal", year: "2025", impact: "", title: "", journal: "" });
    setModal("add");
  };
  const openEdit = (p) => {
    setForm({ ...p, year: String(p.year), impact: String(p.impact) });
    setModal("edit");
  };

  // When staff dropdown changes — auto-fill author name from staff record
  const handleStaffSelect = (e) => {
    const sid = e.target.value;
    const member = teachingStaff.find(s => s.id === sid);
    setForm(prev => ({ ...prev, staff_id: sid, author: member ? member.name : "" }));
  };

  // Recount by staff_id — the reliable FK, not name string
  const recountStaffPubs = (updatedPubs) => {
    if (!setStaff) return;
    setStaff(prev => prev.map(s => ({
      ...s,
      publications: updatedPubs.filter(p => p.staff_id === s.id).length,
    })));
  };

  const save = () => {
    if (!form.staff_id) { toast("Please select an author from staff", "err"); return; }
    const data = { ...form, year: parseInt(form.year) || 2025, impact: parseFloat(form.impact) || "—" };
    let updatedPubs;
    if (modal === "add") {
      updatedPubs = [...pubs, { ...data, id: `P${String(pubs.length + 1).padStart(3, "0")}` }];
      setPubs(updatedPubs);
      toast("Publication added", "ok");
    } else {
      updatedPubs = pubs.map(x => x.id === data.id ? data : x);
      setPubs(updatedPubs);
      toast("Updated", "ok");
    }
    recountStaffPubs(updatedPubs);
    setModal(null);
  };

  const deletePub = (pub) => {
    const updatedPubs = pubs.filter(x => x.id !== pub.id);
    setPubs(updatedPubs);
    recountStaffPubs(updatedPubs);
    toast("Removed", "ok");
  };

  const avgImpact = (() => { const nums = pubs.filter(p => typeof p.impact === "number"); return nums.length ? (nums.reduce((a, p) => a + p.impact, 0) / nums.length).toFixed(1) : "—"; })();

  // Per-staff pub count badge shown in the table
  const pubCountForStaff = (staffId) => pubs.filter(p => p.staff_id === staffId).length;

  return (
    <div>
      <RoleBanner role={role} userName={userName} />
      <div className="ph"><h1>Research & Publications</h1><p>Faculty publications, journals and research output — linked live to Staff records</p></div>
      <div className="stats">
        <Stat label="Total Publications" value={pubs.length} color="blue" icon="📄" />
        <Stat label="Journal Papers" value={pubs.filter(p => p.type === "Journal").length} color="teal" icon="📰" />
        <Stat label="Conference Papers" value={pubs.filter(p => p.type === "Conference").length} color="purple" icon="🎤" />
        <Stat label="Avg Impact Factor" value={avgImpact} color="gold" icon="⭐" />
      </div>

      {/* Staff-wise publication count summary bar */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-head">
          <div className="card-title">👨‍🏫 Staff Publication Counts — Live</div>
          <span className="badge b-blue">{teachingStaff.filter(s => pubCountForStaff(s.id) > 0).length} active researchers</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "10px 16px 14px" }}>
          {teachingStaff.map(s => {
            const cnt = pubCountForStaff(s.id);
            return (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 12px", borderRadius: 20,
                background: cnt > 0 ? "rgba(37,99,235,0.07)" : "var(--bg2)",
                border: `1px solid ${cnt > 0 ? "rgba(37,99,235,0.2)" : "var(--border)"}`,
                fontSize: 12,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: cnt > 0 ? "var(--blue)" : "var(--border-md)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 800, color: "#fff", flexShrink: 0,
                }}>
                  {s.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <span style={{ fontWeight: 600, color: "var(--text2)" }}>{s.name}</span>
                <span style={{
                  fontWeight: 800, fontSize: 13,
                  color: cnt > 0 ? "var(--blue)" : "var(--text4)",
                  fontFamily: "var(--font-mono)",
                  background: cnt > 0 ? "rgba(37,99,235,0.1)" : "transparent",
                  padding: "1px 7px", borderRadius: 10,
                }}>
                  {cnt}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div className="pills" style={{ marginBottom: 0 }}>{types.map(t => <div key={t} className={`pill${filter === t ? " on" : ""}`} onClick={() => setFilter(t)}>{t}</div>)}</div>
        {perms.canAdd && <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Publication</button>}
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>ID</th><th>Title</th><th>Author(s)</th><th>Staff ID</th><th>Journal / Conference</th><th>Year</th><th>Type</th><th>Impact</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><span className="mono">{p.id}</span></td>
                  <td className="fw6" style={{ maxWidth: 220, fontSize: 12 }}>{p.title}</td>
                  <td style={{ fontSize: 12 }}>{p.author}</td>
                  <td><span className="badge b-blue" style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{p.staff_id || "—"}</span></td>
                  <td className="fc3 fs11">{p.journal}</td>
                  <td>{p.year}</td>
                  <td><span className={`badge ${p.type === "Journal" ? "b-gold" : "b-blue"}`}>{p.type}</span></td>
                  <td>{typeof p.impact === "number" ? <span className="badge b-teal">{p.impact}</span> : <span className="fc3">—</span>}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="act act-view" onClick={() => setViewP(p)}>View</button>
                      {perms.canEdit && <button className="act act-edit" onClick={() => openEdit(p)}>Edit</button>}
                      {perms.canDelete && <button className="act act-del" onClick={() => deletePub(p)}>Del</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="empty"><div className="empty-ico">📄</div><p>No publications found</p></div>}
        </div>
      </div>

      {viewP && (
        <Modal title="Publication Details" onClose={() => setViewP(null)} footer={<button className="btn btn-secondary" onClick={() => setViewP(null)}>Close</button>}>
          <div style={{ marginBottom: 16, padding: 16, background: "var(--bg2)", borderRadius: "var(--radius-sm)" }}>
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.4, marginBottom: 8 }}>{viewP.title}</div>
            <div className="fc3 fs11">{viewP.author} · {viewP.year}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["Staff ID", viewP.staff_id || "—"],
              ["Journal/Conference", viewP.journal],
              ["Year", viewP.year],
              ["Type", viewP.type],
              ["Impact Factor", typeof viewP.impact === "number" ? viewP.impact : "N/A"],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
                <div className="fc3 fs11 mb-4">{k}</div>
                <div className="fw7" style={{ fontSize: 13 }}>{v}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {modal && (
        <Modal
          title={`${modal === "add" ? "Add" : "Edit"} Publication`}
          onClose={() => setModal(null)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}
        >
          <div style={{ marginBottom: 12, padding: "8px 12px", background: "rgba(37,99,235,0.06)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(37,99,235,0.15)", fontSize: 12, color: "var(--blue)" }}>
            🔗 Selecting a staff member links this publication via <strong>Staff ID</strong> — the count updates live in the Staff section.
          </div>
          <div className="fg">
            {/* Staff dropdown — the FK selector */}
            <div className="fgrp fg-full">
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text3)" }}>Author (Staff Member) *</label>
              <select
                name="staff_id"
                value={form.staff_id || ""}
                onChange={handleStaffSelect}
                style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontSize: 13, color: "var(--text1)", outline: "none", width: "100%" }}
              >
                <option value="">— Select staff member —</option>
                {teachingStaff.map(s => (
                  <option key={s.id} value={s.id}>{s.id} · {s.name} ({s.dept})</option>
                ))}
              </select>
            </div>
            {form.staff_id && (
              <div className="fgrp fg-full">
                <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text3)" }}>Author Name (auto-filled)</label>
                <input value={form.author} readOnly style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontSize: 13, color: "var(--text2)", width: "100%", fontStyle: "italic" }} />
              </div>
            )}
            <FormField label="Paper Title *" name="title" value={form.title} onChange={change} full />
            <FormField label="Journal / Conference" name="journal" value={form.journal} onChange={change} full />
            <FormField label="Year" name="year" type="number" value={form.year} onChange={change} />
            <FormField label="Type" name="type" type="select" value={form.type} onChange={change} opts={["Journal", "Conference", "Book Chapter", "Patent"]} />
            <FormField label="Impact Factor" name="impact" value={form.impact} onChange={change} />
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── AICTE COMPLIANCE ──────────────────────────────────────────────────────
const CAT_ICONS = { Infrastructure: "🏗️", Faculty: "👨‍🏫", Finances: "💰", Academics: "📚", Compliance: "📋" };
const CAT_COLORS = { Infrastructure: "b-teal", Faculty: "b-blue", Finances: "b-gold", Academics: "b-purple", Compliance: "b-orange" };

const AICTEModule = ({ role, userName, students, staff }) => {
  const perms = PERMS[role];

  // Compute live F:S ratio across all departments for the AICTE Faculty checkpoint
  const totalActiveStudents = (students || []).filter(s => s.status === "Active").length;
  const totalTeachingFaculty = (staff || []).filter(s => s.type === "Teaching" && s.status === "Active").length;
  const liveRatio = totalTeachingFaculty > 0 ? Math.round(totalActiveStudents / totalTeachingFaculty) : null;
  const liveRatioStatus = liveRatio !== null ? (liveRatio > 15 ? "warn" : "ok") : null;
  const liveRatioNote = liveRatio !== null ? `Current 1:${liveRatio} — ${liveRatio > 15 ? "exceeds norm" : "within norm"}` : "No data";

  // Sync the Faculty:Student AICTE checkpoint (ac4) with live data on mount/change
  const [aicteData, setAicteData] = useState(() =>
    AICTE_INIT.map(item =>
      item.id === "ac4" && liveRatioStatus !== null
        ? { ...item, status: liveRatioStatus, note: liveRatioNote }
        : item
    )
  );

  // Keep ac4 in sync whenever students/staff change
  useEffect(() => {
    if (liveRatioStatus !== null) {
      setAicteData(prev => prev.map(item =>
        item.id === "ac4" ? { ...item, status: liveRatioStatus, note: liveRatioNote } : item
      ));
    }
  }, [totalActiveStudents, totalTeachingFaculty]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [editCat, setEditCat] = useState(null);
  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const ok = aicteData.filter(i => i.status === "ok").length;
  const warn = aicteData.filter(i => i.status === "warn").length;
  const score = Math.round((ok / aicteData.length) * 100);

  const categories = [...new Set(aicteData.map(i => i.cat))];

  const openAdd = (cat) => {
    setEditCat(cat);
    setForm({ id: `ac${Date.now()}`, cat, status: "ok", item: "", note: "" });
    setModal("add");
  };

  const openEdit = (item) => {
    setEditCat(item.cat);
    setForm({ ...item });
    setModal("edit");
  };

  const save = () => {
    if (!form.item?.trim()) { toast("Item description required", "err"); return; }
    if (modal === "add") { setAicteData(p => [...p, form]); toast("Checkpoint added", "ok"); }
    else { setAicteData(p => p.map(x => x.id === form.id ? form : x)); toast("Updated", "ok"); }
    setModal(null);
  };

  const del = (id) => {
    if (!window.confirm("Delete this compliance checkpoint?")) return;
    setAicteData(p => p.filter(x => x.id !== id));
    toast("Deleted", "ok");
  };

  return (
    <div>
      <RoleBanner role={role} userName={userName} />
      <div className="ph"><h1>AICTE Compliance</h1><p>Regulatory readiness and inspection checklist — AY 2025–26</p></div>

      <div className="stats">
        <Stat label="Compliance Score" value={`${score}%`} color="blue" icon="🏆" />
        <Stat label="Compliant" value={ok} color="green" icon="✅" />
        <Stat label="Warnings" value={warn} color="orange" icon="⚠️" />
        <Stat label="Total Checkpoints" value={aicteData.length} color="purple" icon="📋" />
      </div>

      {warn > 0 && (
        <div className="notif notif-warn mb-16">
          <span className="notif-ico">⚠️</span>
          <span><strong>{warn} compliance warnings</strong> — Faculty:Student ratio, NAAC renewal, and AICTE annual report need immediate attention.</span>
        </div>
      )}

      <div className="grid2" style={{ marginBottom: 0 }}>
        <div className="card">
          <div className="card-head"><div className="card-title">📊 Compliance Score by Category</div></div>
          <div className="card-body">
            {categories.map(cat => {
              const catItems = aicteData.filter(i => i.cat === cat);
              const catOk = catItems.filter(i => i.status === "ok").length;
              const pct = Math.round((catOk / catItems.length) * 100);
              return (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div className="flex-between mb-4">
                    <span style={{ fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>{CAT_ICONS[cat] || "📋"} {cat}</span>
                    <span className="fc3 fs11">{catOk}/{catItems.length} compliant</span>
                  </div>
                  <div className="pbar">
                    <div className="pfill" style={{ width: `${pct}%`, background: pct === 100 ? "var(--green)" : pct >= 75 ? "var(--gold)" : "var(--red)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><div className="card-title">📅 Inspection Calendar 2025–26</div></div>
          <div className="card-body">
            <div className="tl">
              {[{ c: "tl-red", ico: "📋", t: "Dec 2025", txt: "NAAC Peer Team Visit — A+ Accreditation Renewal" }, { c: "tl-gold", ico: "📊", t: "Aug 2025", txt: "AICTE Annual Compliance Report Submission" }, { c: "tl-blue", ico: "🏛️", t: "Oct 2025", txt: "UGC Inspection — Deemed University Review" }, { c: "tl-purple", ico: "🔬", t: "Jan 2026", txt: "NBA Technical Review — CSE, ECE & AI Programs" }].map((item, i) => (
                <div key={i} className="tl-item"><div className={`tl-dot ${item.c}`}>{item.ico}</div><div className="tl-content"><div className="tl-time">{item.t}</div><div className="tl-text">{item.txt}</div></div></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Per-category grids with add button in each section header */}
      {categories.map(cat => {
        const catItems = aicteData.filter(i => i.cat === cat);
        const catOk = catItems.filter(i => i.status === "ok").length;
        return (
          <div key={cat} className="aicte-section">
            <div className="aicte-section-header">
              <div className="aicte-section-title">
                <span style={{ fontSize: 18 }}>{CAT_ICONS[cat] || "📋"}</span>
                {cat}
                <span className={`badge ${CAT_COLORS[cat] || "b-gray"}`}>{catOk}/{catItems.length}</span>
                {catItems.some(i => i.status === "warn") && <span className="badge b-orange">⚠️ {catItems.filter(i => i.status === "warn").length} Warning{catItems.filter(i => i.status === "warn").length > 1 ? "s" : ""}</span>}
              </div>
              {perms.canAdd && (
                <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }} onClick={() => openAdd(cat)}>
                  + Add {cat} Checkpoint
                </button>
              )}
            </div>
            <div className="aicte-items-grid">
              {catItems.map((item, idx) => (
                <div key={item.id} className="aicte-item" style={{
                  ...(catItems.length % 2 !== 0 && idx === catItems.length - 1 ? { gridColumn: "1/-1", borderRight: "none" } : {})
                }}>
                  <span className="aicte-item-icon">{item.status === "ok" ? "✅" : "⚠️"}</span>
                  <div className="aicte-item-body">
                    <div className="aicte-item-text">{item.item}</div>
                    <div className="aicte-item-note">
                      <span className={`badge ${item.status === "ok" ? "b-green" : "b-orange"}`} style={{ fontSize: 9 }}>{item.note}</span>
                    </div>
                  </div>
                  {(perms.canEdit || perms.canDelete) && (
                    <div className="aicte-item-actions">
                      {perms.canEdit && <button className="act act-edit" onClick={() => openEdit(item)}>Edit</button>}
                      {perms.canDelete && <button className="act act-del" onClick={() => del(item.id)}>Del</button>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Institution Records */}
      <div className="card">
        <div className="card-head"><div className="card-title">🏫 Institution Records</div></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          {[["Institution Type", "Deemed University (De-Novo)"], ["AICTE Approval", "AICTE/FN/1-23456789/2024"], ["UGC Recognition", "UGC Act 1956, Section 3"], ["Established", "1992"], ["Campus Area", "125 Acres"], ["NAAC Grade", "A+ (CGPA 3.68)"], ["NBA Accredited", "CSE, ECE, ME, AI (2023–26)"], ["Endowment Fund", "₹9.8 Crores"]].map(([k, v], i) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 18px", borderBottom: "1px solid var(--border)", borderRight: i % 2 === 0 ? "1px solid var(--border)" : "none", fontSize: 12 }}>
              <span className="fc3">{k}</span><span className="fw7">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <Modal title={`${modal === "add" ? "Add" : "Edit"} ${form.cat} Checkpoint`} onClose={() => setModal(null)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save Checkpoint</button></>}>
          <div className="fg">
            <FormField label="Category" name="cat" type="select" value={form.cat} onChange={change} opts={["Infrastructure", "Faculty", "Finances", "Academics", "Compliance"]} />
            <FormField label="Status" name="status" type="select" value={form.status} onChange={change} opts={[{ v: "ok", l: "✅ Compliant" }, { v: "warn", l: "⚠️ Warning" }]} />
            <FormField label="Compliance Item Description" name="item" value={form.item} onChange={change} full />
            <FormField label="Note / Current Value" name="note" value={form.note} onChange={change} full />
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── REPORTS ───────────────────────────────────────────────────────────────
const Reports = ({ role, userName }) => {
  const [activeReport, setActiveReport] = useState(null);
  const reps = [
    { ico: "📊", title: "Student Analytics", desc: "Enrollment, attrition, gender diversity, dept-wise distribution", badge: "Live", color: "b-teal" },
    { ico: "💰", title: "Financial Report", desc: "Fee collection, dues, breakup by dept and category", badge: "Monthly", color: "b-gold" },
    { ico: "📝", title: "Exam Results", desc: "Pass/fail analysis, topper lists, backlog tracking", badge: "Semester", color: "b-blue" },
    { ico: "✅", title: "Attendance Report", desc: "Dept-wise, subject-wise attendance with shortfall alerts", badge: "Daily", color: "b-green" },
    { ico: "🔬", title: "Research Output", desc: "Publications, patents, grants and funded projects", badge: "Annual", color: "b-purple" },
    { ico: "🏆", title: "AICTE Data Sheet", desc: "AQAR data, NIRF rankings, NAAC SSR inputs", badge: "Annual", color: "b-orange" },
  ];
  return (
    <div>
      <RoleBanner role={role} userName={userName} />
      <div className="ph"><h1>Reports & Analytics</h1><p>Generate institutional reports and data exports</p></div>
      <div className="grid3">{reps.map(r => (<div key={r.title} className="rep-card" onClick={() => setActiveReport(r.title)}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}><span style={{ fontSize: 28 }}>{r.ico}</span><span className={`badge ${r.color}`}>{r.badge}</span></div><div className="fw7" style={{ fontSize: 13 }}>{r.title}</div><div className="fc3 fs11" style={{ lineHeight: 1.6 }}>{r.desc}</div><button className="act act-view" style={{ alignSelf: "flex-start" }}>Generate ↗</button></div>))}</div>
      <div className="notif notif-info"><span className="notif-ico">ℹ️</span><span>Reports fetch live data from the configured backend API (<code>{API_BASE_LABEL}</code>). Ensure the backend is running.</span></div>
      {activeReport && <ReportModal reportTitle={activeReport} onClose={() => setActiveReport(null)} />}
    </div>
  );
};

// ─── ALUMNI ────────────────────────────────────────────────────────────────
// ─── ALUMNI COMPONENT ──────────────────────────────────────────────────────
const Alumni = ({ alumni, setAlumni, students, depts: liveDepts, role, userName }) => {
  const perms = PERMS[role];
  const deptOptions = resolveDeptIds(liveDepts, ["HUM"], "Academic");

  const [view, setView] = useState("cards"); // "cards" | "table"
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterSector, setFilterSector] = useState("All");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [viewA, setViewA] = useState(null);

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const sectors = ["All", "IT/Software", "Core Engineering", "Finance/Banking", "Government/PSU", "Higher Studies", "Startup/Entrepreneur", "Healthcare", "Other"];

  const filtered = alumni.filter(a =>
    (filterDept === "All" || a.dept === filterDept) &&
    (filterSector === "All" || a.sector === filterSector) &&
    (
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.dept?.toLowerCase().includes(search.toLowerCase()) ||
      a.employer?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const openAdd = () => {
    setForm({
      batch: String(new Date().getFullYear()),
      dept: deptOptions[0] || "CSE", cgpa: "0", gender: "Male", status: "Inactive",
      name: "", email: "", phone: "", address: "",
      employer: "", jobTitle: "", workCity: "", sector: "", passYear: String(new Date().getFullYear()),
    });
    setModal("add");
  };

  const openEdit = a => {
    setForm({ ...a, batch: String(a.batch || a.passYear || new Date().getFullYear()), cgpa: String(a.cgpa), passYear: String(a.passYear || "") });
    setModal("edit");
  };

  const save = async () => {
    if (!form.name?.trim()) { toast("Name required", "err"); return; }
    const payload = {
      ...form,
      batch: parseInt(form.batch || form.passYear) || new Date().getFullYear(),
      passYear: String(form.passYear || form.batch || ""),
      cgpa: parseFloat(form.cgpa) || 0,
      status: "Inactive",
    };
    try {
      if (modal === "add") {
        await alumniApi.create(payload);
      } else {
        await alumniApi.update(form.id, payload);
      }
      const res = await alumniApi.list();
      setAlumni(Array.isArray(res?.alumni) ? res.alumni : []);
      toast(modal === "add" ? "Alumni added" : "Updated", "ok");
      setModal(null);
    } catch (err) {
      toast(err.message || "Failed to save alumni", "err");
    }
  };

  const initials = name => name ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?";
  const avatarColors = ["linear-gradient(135deg,#2563eb,#6366f1)", "linear-gradient(135deg,#0891b2,#06b6d4)", "linear-gradient(135deg,#7c3aed,#a855f7)", "linear-gradient(135deg,#16a34a,#22c55e)", "linear-gradient(135deg,#d97706,#f59e0b)", "linear-gradient(135deg,#dc2626,#ef4444)"];
  const getColor = name => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  const employed = alumni.filter(a => a.employer?.trim()).length;
  const higherStudies = alumni.filter(a => a.sector === "Higher Studies").length;

  return (
    <div>
      <RoleBanner role={role} userName={userName} />
      <div className="ph"><h1>Alumni Network</h1><p>Graduated student registry with employment & career tracking</p></div>

      <div className="stats">
        <Stat label="Total Alumni" value={alumni.length} color="blue" icon="🎓" />
        <Stat label="Placed / Employed" value={employed} color="green" icon="💼" trend={`${alumni.length > 0 ? Math.round((employed / alumni.length) * 100) : 0}% placement`} />
        <Stat label="Higher Studies" value={higherStudies} color="purple" icon="📚" />
        <Stat label="Avg CGPA" value={alumni.length ? (alumni.reduce((a, x) => a + (parseFloat(x.cgpa) || 0), 0) / alumni.length).toFixed(1) : "—"} color="gold" icon="📊" />
      </div>

      {/* Controls */}
      <div className="batch-filter-bar">
        <input
          placeholder="🔍  Search name, dept, employer…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ width: 110 }}>
          {["All", ...deptOptions].map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={filterSector} onChange={e => setFilterSector(e.target.value)} style={{ width: 160 }}>
          {sectors.map(s => <option key={s}>{s}</option>)}
        </select>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            className={`btn btn-sm ${view === "cards" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setView("cards")} title="Card view"
          >⊞ Cards</button>
          <button
            className={`btn btn-sm ${view === "table" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setView("table")} title="Table view"
          >☰ Table</button>
        </div>
        {perms.canAdd && <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Alumni</button>}
      </div>

      <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14 }}>
        Showing <strong>{filtered.length}</strong> of {alumni.length} alumni
        {filterDept !== "All" && <> · Dept: <strong>{filterDept}</strong></>}
        {filterSector !== "All" && <> · Sector: <strong>{filterSector}</strong></>}
      </div>

      {/* ── CARD VIEW ── */}
      {view === "cards" && (
        <div className="alumni-grid">
          {filtered.map(a => (
            <div key={a.id} className="alumni-card">
              <div className="alumni-card-header">
                <div className="alumni-avatar" style={{ background: getColor(a.name) }}>{initials(a.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                    <span className="badge b-blue">{a.dept}</span>
                    <span style={{ color: (parseFloat(a.cgpa) >= 8 ? "var(--green)" : "var(--gold)"), fontWeight: 700, fontSize: 11 }}>CGPA {a.cgpa}</span>
                    {a.passYear && <span className="badge b-gray">'{String(a.passYear).slice(-2)}</span>}
                  </div>
                </div>
              </div>
              <div className="alumni-card-body">
                {a.employer?.trim() ? (
                  <div className="alumni-work-badge">
                    <span>💼</span>
                    <div>
                      <div style={{ fontWeight: 700 }}>{a.employer}</div>
                      {a.jobTitle && <div style={{ fontSize: 10, opacity: 0.8 }}>{a.jobTitle}{a.workCity ? ` · ${a.workCity}` : ""}</div>}
                    </div>
                  </div>
                ) : (
                  <span className="alumni-not-working">💼 Employment not updated</span>
                )}
                {a.sector && (
                  <div className="alumni-info-row">
                    <span className="alumni-info-icon">🏷️</span>
                    <span className="fc3">{a.sector}</span>
                  </div>
                )}
                {a.email && (
                  <div className="alumni-info-row">
                    <span className="alumni-info-icon">✉️</span>
                    <span className="fc3" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.email}</span>
                  </div>
                )}
                {a.phone && (
                  <div className="alumni-info-row">
                    <span className="alumni-info-icon">📞</span>
                    <span className="fc3">{a.phone}</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <button className="act act-view" style={{ flex: 1, textAlign: "center" }} onClick={() => setViewA(a)}>View</button>
                  {perms.canEdit && <button className="act act-edit" style={{ flex: 1, textAlign: "center" }} onClick={() => openEdit(a)}>Edit</button>}
                </div>
              </div>
            </div>
          ))}
          {!filtered.length && <div className="empty" style={{ gridColumn: "1/-1" }}><div className="empty-ico">🎓</div><p>No alumni records found</p></div>}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {view === "table" && (
        <div className="card att-card">
          <div className="card-head"><div className="card-title">🎓 Alumni Records — {filtered.length}</div></div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Dept</th><th>CGPA</th><th>Pass Year</th><th>Employer</th><th>Job Title</th><th>City</th><th>Sector</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td><span className="mono">{a.id}</span></td>
                    <td className="fw6">{a.name}</td>
                    <td><span className="badge b-blue">{a.dept}</span></td>
                    <td style={{ color: parseFloat(a.cgpa) >= 8 ? "var(--green)" : "var(--gold)", fontWeight: 700 }}>{a.cgpa}</td>
                    <td className="fc3 fs11">{a.passYear || "—"}</td>
                    <td className="fw6 fs11">{a.employer || <span className="fc3">—</span>}</td>
                    <td className="fc3 fs11">{a.jobTitle || "—"}</td>
                    <td className="fc3 fs11">{a.workCity || "—"}</td>
                    <td>{a.sector ? <span className="badge b-purple">{a.sector}</span> : <span className="fc3">—</span>}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="act act-view" onClick={() => setViewA(a)}>View</button>
                        {perms.canEdit && <button className="act act-edit" onClick={() => openEdit(a)}>Edit</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && <div className="empty"><div className="empty-ico">🎓</div><p>No alumni records found</p></div>}
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewA && (
        <Modal title="Alumni Profile" onClose={() => setViewA(null)}
          footer={<><button className="btn btn-secondary" onClick={() => setViewA(null)}>Close</button>{perms.canEdit && <button className="btn btn-primary" onClick={() => { setViewA(null); openEdit(viewA); }}>Edit</button>}</>}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0 20px", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: getColor(viewA.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff" }}>{initials(viewA.name)}</div>
            <div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 800 }}>{viewA.name}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <span className="badge b-blue">{viewA.dept}</span>
                <span className="badge b-purple">Alumni</span>
                {viewA.passYear && <span className="badge b-gray">Batch {viewA.passYear}</span>}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[["Student ID", viewA.id], ["CGPA", viewA.cgpa], ["Email", viewA.email || "—"], ["Phone", viewA.phone || "—"]].map(([k, v]) => (
              <div key={k} style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
                <div className="fc3 fs11 mb-4">{k}</div>
                <div className="fw7" style={{ fontSize: 13 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", overflow: "hidden", marginBottom: 10 }}>
            <div style={{ padding: "10px 14px", background: "var(--bg3)", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              💼 Current Employment
            </div>
            {viewA.employer?.trim() ? (
              <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["Employer / Company", viewA.employer || "—"], ["Job Title / Role", viewA.jobTitle || "—"], ["Work City", viewA.workCity || "—"], ["Sector", viewA.sector || "—"]].map(([k, v]) => (
                  <div key={k} style={{ background: "var(--bg1)", borderRadius: "var(--radius-sm)", padding: "8px 12px" }}>
                    <div className="fc3 fs11 mb-4">{k}</div>
                    <div className="fw7" style={{ fontSize: 13 }}>{v}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "20px 16px", textAlign: "center", color: "var(--text4)", fontSize: 12 }}>Employment information not updated yet</div>
            )}
          </div>
        </Modal>
      )}

      {/* ADD / EDIT MODAL */}
      {modal && (
        <Modal
          title={modal === "add" ? "Add Alumni" : "Edit Alumni"}
          onClose={() => setModal(null)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}
        >
          {/* Personal Info */}
          <div style={{ fontWeight: 700, fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>👤 Personal Details</div>
          <div className="fg" style={{ marginBottom: 18 }}>
            <FormField label="Full Name *" name="name" value={form.name} onChange={change} full />
            <FormField label="Department" name="dept" type="select" value={form.dept} onChange={change} opts={deptOptions} />
            <FormField label="CGPA" name="cgpa" type="number" value={form.cgpa} onChange={change} />
            <FormField label="Gender" name="gender" type="select" value={form.gender} onChange={change} opts={["Male", "Female", "Other"]} />
            <FormField label="Pass-out Year" name="passYear" type="number" value={form.passYear} onChange={change} />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={change} />
            <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={change} />
            <FormField label="Address" name="address" type="textarea" value={form.address} onChange={change} full />
          </div>

          {/* Employment Info */}
          <div style={{ fontWeight: 700, fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>💼 Employment Information</div>
          <div className="fg">
            <FormField label="Current Employer / Company" name="employer" value={form.employer} onChange={change} full />
            <FormField label="Job Title / Role" name="jobTitle" value={form.jobTitle} onChange={change} />
            <FormField label="Work City" name="workCity" value={form.workCity} onChange={change} />
            <FormField label="Sector" name="sector" type="select" value={form.sector} onChange={change}
              opts={["", ...sectors.filter(s => s !== "All")]} />
          </div>
        </Modal>
      )}
    </div>
  );
};


// ─── BATCHES ───────────────────────────────────────────────────────────────
const Batches = ({ students, depts: liveDepts, role, userName }) => {
  const perms = PERMS[role];
  const deptOptions = resolveDeptIds(liveDepts, ["HUM"], "Academic");
  const [batchMeta, setBatchMeta] = useState([]);
  const [batchYear, setBatchYear] = useState("");
  const [batchTab, setBatchTab] = useState("overview");
  const [yearModal, setYearModal] = useState(false);
  const [yearForm, setYearForm] = useState({ year: "" });
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [viewStudent, setViewStudent] = useState(null);
  const [metaLoading, setMetaLoading] = useState(false);

  const loadBatchMeta = useCallback(async () => {
    setMetaLoading(true);
    try {
      const res = await batchesApi.list();
      setBatchMeta(Array.isArray(res?.batches) ? res.batches : []);
    } catch (err) {
      console.warn("Batch registry load failed:", err.message);
      setBatchMeta([]);
    } finally {
      setMetaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBatchMeta();
  }, [loadBatchMeta]);

  const cgpaColor = (v) => parseFloat(v) >= 8.5 ? "var(--green)" : parseFloat(v) >= 7 ? "var(--gold)" : "var(--red)";
  const liveYears = [...new Set(students.map((student) => String(student.batch || "")).filter(Boolean))];
  const registryYears = [...new Set(batchMeta.map((row) => String(row.year || "")).filter(Boolean))];
  const years = [...new Set([...liveYears, ...registryYears])].sort((a, b) => (parseInt(b, 10) || 0) - (parseInt(a, 10) || 0) || String(b).localeCompare(String(a)));
  const academicYearLabel = batchYear ? `${batchYear}-${String((parseInt(batchYear, 10) || 0) + 1).slice(-2)}` : "—";

  useEffect(() => {
    if (!years.length) {
      if (batchYear) setBatchYear("");
      return;
    }
    if (!batchYear || !years.includes(batchYear)) setBatchYear(years[0]);
  }, [batchYear, years]);

  const yearStudents = students.filter((student) => String(student.batch || "") === batchYear);
  const yearRegistryRows = batchMeta.filter((row) => String(row.year || "") === batchYear && row.dept);
  const mentorByDept = Object.fromEntries(yearRegistryRows.map((row) => [row.dept, row.mentor || "—"]));

  const deptSummaries = deptOptions
    .map((deptId) => {
      const deptStudents = yearStudents.filter((student) => student.dept === deptId);
      const count = deptStudents.length;
      if (!count) return null;
      const avgCgpa = deptStudents.reduce((sum, student) => sum + (parseFloat(student.cgpa) || 0), 0) / count;
      const paidCount = deptStudents.filter((student) => student.fee_status === "Paid").length;
      const pendingCount = deptStudents.filter((student) => student.fee_status !== "Paid").length;
      return {
        id: deptId,
        dept: deptId,
        total: count,
        active: deptStudents.filter((student) => student.status === "Active").length,
        avgCgpa,
        paidCount,
        pendingCount,
        mentor: mentorByDept[deptId] || "—",
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.total - a.total || a.dept.localeCompare(b.dept));

  const totalStudents = yearStudents.length;
  const activeStudents = yearStudents.filter((student) => student.status === "Active").length;
  const fullyPaid = yearStudents.filter((student) => student.fee_status === "Paid").length;
  const pendingFees = yearStudents.filter((student) => student.fee_status !== "Paid").length;
  const avgCgpa = totalStudents
    ? (yearStudents.reduce((sum, student) => sum + (parseFloat(student.cgpa) || 0), 0) / totalStudents).toFixed(1)
    : "—";

  const filteredStudents = yearStudents.filter((student) =>
    (filterDept === "All" || student.dept === filterDept) &&
    (student.name?.toLowerCase().includes(search.toLowerCase()) || student.id?.toLowerCase().includes(search.toLowerCase()))
  );

  const saveYear = async () => {
    const year = yearForm.year.trim();
    if (!/^\d{4}$/.test(year)) { toast("Enter a valid 4-digit year", "err"); return; }
    if (years.includes(year)) { toast(`Year ${year} already exists`, "err"); return; }
    try {
      await batchesApi.create({ id: `YR-${year}`, year, dept: "", students: 0, mentor: "" });
      await loadBatchMeta();
      setBatchYear(year);
      setYearModal(false);
      setYearForm({ year: "" });
      toast(`Academic year ${year}-${String(parseInt(year, 10) + 1).slice(-2)} added`, "ok");
    } catch (err) {
      toast(err.message || "Failed to add year", "err");
    }
  };

  const quickJumpToDept = (deptId) => {
    setFilterDept(deptId);
    setBatchTab("students");
  };

  return (
    <div>
      <RoleBanner role={role} userName={userName} />
      <div className="ph"><h1>Batch Intelligence</h1><p>Live academic-year view derived from the students database, with year registry support</p></div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ display: "grid", gridTemplateColumns: "minmax(220px, 280px) 1fr auto", gap: 14, alignItems: "end" }}>
          <div>
            <div className="fc3 fs11 mb-4" style={{ fontWeight: 700, textTransform: "uppercase" }}>Admission Year</div>
            <select value={batchYear} onChange={(e) => { setBatchYear(e.target.value); setFilterDept("All"); }} style={{ width: "100%" }}>
              {years.map((year) => <option key={year} value={year}>{year} · AY {year}-{String((parseInt(year, 10) || 0) + 1).slice(-2)}</option>)}
            </select>
          </div>
          <div>
            <div className="tabs" style={{ marginBottom: 0, border: "none", justifyContent: "flex-start" }}>
              <div className={`tab${batchTab === "overview" ? " on" : ""}`} onClick={() => setBatchTab("overview")}>📊 Overview</div>
              <div className={`tab${batchTab === "students" ? " on" : ""}`} onClick={() => setBatchTab("students")}>🎓 Student Records</div>
            </div>
          </div>
          {perms.canAdd && (
            <button className="btn btn-primary btn-sm" onClick={() => setYearModal(true)}>+ Add Year</button>
          )}
        </div>
      </div>

      <div className="notif notif-info" style={{ marginBottom: 16 }}>
        <span className="notif-ico">ℹ️</span>
        <div style={{ flex: 1 }}>
          <strong>Real-time source:</strong> all counts below are computed directly from students whose `batch` equals <strong>{batchYear || "—"}</strong>.
          {metaLoading && <span style={{ marginLeft: 8, color: "var(--text3)" }}>Refreshing year registry…</span>}
        </div>
      </div>

      {batchYear && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.8fr", gap: 16, marginBottom: 18 }}>
          <div style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(8,145,178,0.08))", border: "1px solid rgba(37,99,235,0.14)", borderRadius: "var(--radius)", padding: "18px 20px" }}>
            <div className="fc3 fs11 mb-4" style={{ fontWeight: 700, textTransform: "uppercase" }}>Selected Year</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 24, fontWeight: 800, color: "var(--text1)" }}>{batchYear}</div>
            <div style={{ color: "var(--text3)", marginTop: 4 }}>Academic Year {academicYearLabel}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              <span className="badge b-blue">{totalStudents} students</span>
              <span className="badge b-teal">{deptSummaries.length} departments</span>
              <span className="badge b-green">{fullyPaid} fully paid</span>
              <span className="badge b-gold">{pendingFees} pending fees</span>
            </div>
          </div>
          <div style={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "18px 20px" }}>
            <div className="fc3 fs11 mb-6" style={{ fontWeight: 700, textTransform: "uppercase" }}>Quality Snapshot</div>
            <div style={{ display: "grid", gap: 10 }}>
              <div className="flex-between"><span className="fc3">Active Students</span><strong>{activeStudents}</strong></div>
              <div className="flex-between"><span className="fc3">Average CGPA</span><strong>{avgCgpa}</strong></div>
              <div className="flex-between"><span className="fc3">Fee Clearance</span><strong>{totalStudents ? `${Math.round((fullyPaid / totalStudents) * 100)}%` : "—"}</strong></div>
              <div className="flex-between"><span className="fc3">Largest Department</span><strong>{deptSummaries[0] ? `${deptSummaries[0].dept} (${deptSummaries[0].total})` : "—"}</strong></div>
            </div>
          </div>
        </div>
      )}

      {batchTab === "overview" && (
        <>
          <div className="stats">
            <Stat label="Total Students" value={totalStudents} color="blue" icon="🎓" />
            <Stat label="Departments Covered" value={deptSummaries.length} color="teal" icon="🏛️" />
            <Stat label="Average CGPA" value={avgCgpa} color="purple" icon="📊" />
            <Stat label="Pending Fees" value={pendingFees} color="red" icon="⏳" />
          </div>

          <div className="grid2">
            <div className="card">
              <div className="card-head">
                <div className="card-title">🏛️ Year Overview — {academicYearLabel}</div>
                <span className="badge b-blue">{deptSummaries.length} live groups</span>
              </div>
              <div className="card-body">
                {!deptSummaries.length && <div className="empty" style={{ padding: "20px" }}><p>No students found for batch year {batchYear}. Add students with that batch year to populate this view.</p></div>}
                {deptSummaries.map((summary) => (
                  <div key={summary.dept} style={{ marginBottom: 14 }}>
                    <div className="flex-between mb-4">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{summary.dept}</div>
                        <div className="fc3 fs11">Avg CGPA {summary.avgCgpa.toFixed(1)} · Mentor {summary.mentor}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span className="badge b-teal">{summary.total} students</span>
                        <button className="act act-view" style={{ padding: "2px 8px", fontSize: 10 }} onClick={() => quickJumpToDept(summary.dept)}>
                          Roster →
                        </button>
                      </div>
                    </div>
                    <div className="pbar"><div className="pfill" style={{ width: totalStudents ? `${(summary.total / totalStudents) * 100}%` : "0%", background: "var(--blue)" }} /></div>
                    <div style={{ display: "flex", gap: 10, marginTop: 5, fontSize: 11, color: "var(--text3)", flexWrap: "wrap" }}>
                      <span>Active: {summary.active}</span>
                      <span>Fully Paid: {summary.paidCount}</span>
                      <span>Pending: {summary.pendingCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <div className="card-title">📋 Batch Summary</div>
                <span className="badge b-purple">Live from DB</span>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Dept</th><th>Students</th><th>Active</th><th>Avg CGPA</th><th>Fee Pending</th><th>Mentor</th><th>Actions</th></tr></thead>
                  <tbody>
                    {deptSummaries.map((summary) => (
                      <tr key={summary.dept}>
                        <td><span className="badge b-blue">{summary.dept}</span></td>
                        <td><strong>{summary.total}</strong></td>
                        <td>{summary.active}</td>
                        <td style={{ color: cgpaColor(summary.avgCgpa), fontWeight: 700 }}>{summary.avgCgpa.toFixed(1)}</td>
                        <td><span className={`badge ${summary.pendingCount > 0 ? "b-gold" : "b-green"}`}>{summary.pendingCount}</span></td>
                        <td className="fs11 fc2">{summary.mentor}</td>
                        <td><button className="act act-view" onClick={() => quickJumpToDept(summary.dept)}>Roster</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!deptSummaries.length && <div className="empty"><p>No live batch summary available for {batchYear}.</p></div>}
              </div>
            </div>
          </div>
        </>
      )}

      {batchTab === "students" && (
        <>
          <div className="batch-filter-bar" style={{ marginBottom: 14 }}>
            <input placeholder="🔍  Search by name or ID…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, minWidth: 220 }} />
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={{ width: 120 }}>
              {["All", ...deptOptions].map((dept) => <option key={dept}>{dept}</option>)}
            </select>
          </div>

          <div className="notif notif-info" style={{ marginBottom: 14 }}>
            <span className="notif-ico">🎓</span>
            <div style={{ flex: 1 }}>
              Showing <strong>{filteredStudents.length}</strong> students for batch year <strong>{batchYear || "—"}</strong>
              {filterDept !== "All" && <> in <strong>{filterDept}</strong></>}
            </div>
          </div>

          <div className="tbl-wrap">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Dept</th><th>Year</th><th>Batch</th><th>CGPA</th><th>Fee Status</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td><span className="mono">{student.id}</span></td>
                    <td className="fw6">{student.name}</td>
                    <td><span className="badge b-blue">{student.dept}</span></td>
                    <td>Yr {student.year}</td>
                    <td className="fc3 fs11">{student.batch || "—"}</td>
                    <td style={{ color: cgpaColor(student.cgpa), fontWeight: 700 }}>{student.cgpa}</td>
                    <td><span className={`badge ${student.fee_status === "Paid" ? "b-green" : student.fee_status === "Pending" ? "b-gold" : "b-red"}`}>{student.fee_status || "—"}</span></td>
                    <td>{student.email || <span className="fc3">—</span>}</td>
                    <td>{student.phone || <span className="fc3">—</span>}</td>
                    <td><button className="act act-view" onClick={() => setViewStudent(student)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredStudents.length && <div className="empty"><p>No students found for this year and filter combination.</p></div>}
          </div>
        </>
      )}

      {viewStudent && (
        <Modal title="Student Profile" onClose={() => setViewStudent(null)} footer={<button className="btn btn-secondary" onClick={() => setViewStudent(null)}>Close</button>}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0 20px", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff" }}>{viewStudent.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}</div>
            <div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 800 }}>{viewStudent.name}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                <span className="badge b-blue">{viewStudent.dept}</span>
                <span className="badge b-gray">Batch {viewStudent.batch || "—"}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              ["Student ID", viewStudent.id],
              ["Year", `Year ${viewStudent.year}`],
              ["Batch", viewStudent.batch || "—"],
              ["CGPA", viewStudent.cgpa],
              ["Fee Status", viewStudent.fee_status || "—"],
              ["Email", viewStudent.email || "—"],
              ["Phone", viewStudent.phone || "—"],
              ["Transport", viewStudent.transport || "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
                <div className="fc3 fs11 mb-4">{k}</div>
                <div className="fw7" style={{ fontSize: 13 }}>{v}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {yearModal && (
        <Modal title="Add Academic Year" onClose={() => setYearModal(false)} footer={<><button className="btn btn-secondary" onClick={() => setYearModal(false)}>Cancel</button><button className="btn btn-primary" onClick={saveYear}>Add Year</button></>}>
          <div className="notif notif-info" style={{ marginBottom: 14 }}>
            <span className="notif-ico">ℹ️</span>
            <span>This registers a year in the batch selector. Student counts will still come only from the students database.</span>
          </div>
          <div className="fg">
            <FormField label="Admission Year *" name="year" type="number" value={yearForm.year} onChange={(e) => setYearForm({ year: e.target.value })} placeholder="e.g. 2026" full />
            <FormField label="Academic Year" name="academicYearPreview" value={yearForm.year && /^\d{4}$/.test(yearForm.year) ? `${yearForm.year}-${String(parseInt(yearForm.year, 10) + 1).slice(-2)}` : ""} onChange={() => { }} full disabled />
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── NAV ───────────────────────────────────────────────────────────────────
const NAV = [
  { sec: "Overview", items: [{ id: "dashboard", ico: "🏠", lbl: "Dashboard" }] },
  { sec: "Academic", items: [{ id: "students", ico: "🎓", lbl: "Students" }, { id: "departments", ico: "🏛️", lbl: "Departments" }, { id: "staff", ico: "👨‍🏫", lbl: "Staff" }, { id: "courses", ico: "📖", lbl: "Courses" }, { id: "exams", ico: "📝", lbl: "Examinations" }] },
  { sec: "Operations", items: [{ id: "attendance", ico: "✅", lbl: "Attendance" }, { id: "fees", ico: "💰", lbl: "Fees" }, { id: "transport", ico: "🚌", lbl: "Transport" }] },
  { sec: "Records", items: [{ id: "certificates", ico: "📜", lbl: "Certificates" }, { id: "publications", ico: "🔬", lbl: "Publications" }, { id: "aicte", ico: "🏆", lbl: "AICTE" }, { id: "reports", ico: "📊", lbl: "Reports" }, { id: "alumni", ico: "👥", lbl: "Alumni" }, { id: "batches", ico: "📅", lbl: "Batches" }] },
];

const PAGE_TITLES = {
  dashboard: "Dashboard", students: "Students", departments: "Departments", staff: "Staff", courses: "Courses",
  exams: "Examinations", attendance: "Attendance", fees: "Fee Management", transport: "Transport",
  certificates: "Certificates", publications: "Publications", aicte: "AICTE Compliance",
  reports: "Reports", alumni: "Alumni", batches: "Batches"
};

const STORAGE_KEY = "erp_current_page";

// ─── APP ROOT ───────────────────────────────────────────────────────────────
export default function CollegeERP({ initialRole = "Admin", userName = "Admin User", onLogout }) {
  const [page, setPageState] = useState(() => {
    const saved = getStoredValue(STORAGE_KEY);
    if (saved && PAGE_TITLES[saved]) return saved;
    return "dashboard";
  });

  const setPage = (p) => {
    setPageState(p);
    setStoredValue(STORAGE_KEY, p);
  };

  const [role] = useState(initialRole);
  const [loading, setLoading] = useState(true);

  // Start as empty — backend is the ONLY source of truth
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [fees, setFees] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [alerts, setAlerts] = useState([]);
  // Pubs lifted to root so Publications ↔ Staff counts stay in sync across navigation
  const [pubs, setPubs] = useState(PUBS);
  // Departments are loaded from backend and kept in memory.
  const [depts, setDepts] = useState([]);


  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [feeStorageMigrationChecked, setFeeStorageMigrationChecked] = useState(false);

  const perms = PERMS[role];

  // ── Load ALL data from backend on every mount ──────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      setLoading(true);
      try {
        const [
          studentsRes,
          alumniRes,
          staffRes,
          departmentsRes,
          coursesRes,
          examsRes,
          feesRes,
          transportRes,
          alertsRes,
        ] = await Promise.all([
          studentsApi.list(),
          alumniApi.list(),
          staffApi.list(),
          deptsApi.list(),
          coursesApi.list(),
          examsApi.list(),
          feesApi.list(),
          transportApi.list(),
          alertsApi.list(),
        ]);

        if (cancelled) return;

        if (Array.isArray(studentsRes?.students)) setStudents(studentsRes.students);
        if (Array.isArray(alumniRes?.alumni)) setAlumni(alumniRes.alumni);
        if (Array.isArray(staffRes?.staff)) setStaff(staffRes.staff);
        if (Array.isArray(departmentsRes?.departments)) setDepts(departmentsRes.departments);
        if (Array.isArray(coursesRes?.courses)) setCourses(coursesRes.courses);
        if (Array.isArray(examsRes?.exams)) setExams(examsRes.exams);
        if (Array.isArray(feesRes?.fees)) setFees(feesRes.fees);
        if (Array.isArray(transportRes?.routes)) setRoutes(transportRes.routes);
        if (Array.isArray(alertsRes?.alerts)) setAlerts(alertsRes.alerts);

      } catch (err) {
        console.warn("Backend load failed.", err.message);
        if (!depts.length) setDepts(DEPTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadAll();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (loading || feeStorageMigrationChecked) return;

    const legacyStandards = loadLegacyFeeStandards();
    const legacyCollections = loadLegacyStudentFeeCollections();
    const legacyCollectionEntries = Object.entries(legacyCollections).filter(([, value]) => value && typeof value === "object");
    if (!legacyStandards && !legacyCollectionEntries.length) {
      setFeeStorageMigrationChecked(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        let mutated = false;
        const currentStandards = feeStandardsFromFees(fees);

        if (legacyStandards && fees.length) {
          const rateUpdates = fees
            .map((row) => {
              const component = FEE_COMPONENT_BY_TYPE[row.type];
              if (!component) return null;
              const nextAmount = Math.max(0, feeNumber(legacyStandards[component.key]));
              if (nextAmount === feeNumber(row.amount)) return null;
              return {
                id: row.id,
                type: row.type,
                amount: nextAmount,
                freq: row.freq,
                due_date: row.due_date,
                collected: feeNumber(row.collected),
                pending: feeNumber(row.pending),
              };
            })
            .filter(Boolean);

          if (rateUpdates.length) {
            await Promise.all(rateUpdates.map((row) => feesApi.update(row.id, row)));
            mutated = true;
          }
          try { localStorage.removeItem(LEGACY_FEE_STANDARDS_KEY); } catch { }
        }

        if (legacyCollectionEntries.length) {
          const updates = legacyCollectionEntries
            .map(([studentId, rawCollections]) => {
              const student = students.find(s => s.id === studentId);
              if (!student) return null;

              const frontCollections = Object.fromEntries(
                FEE_COMPONENTS.map(({ key }) => [key, Math.max(0, feeNumber(rawCollections[key]))]),
              );
              const assignedHeads = Object.fromEntries(
                FEE_COMPONENTS.map(({ key, studentKey }) => [
                  key,
                  feeNumber(frontCollections[key]) > 0 || feeNumber(student[studentKey] ?? student[key]) > 0,
                ]),
              );
              const demandValues = Object.fromEntries(
                FEE_COMPONENTS.map(({ key, studentKey }) => [
                  key,
                  assignedHeads[key] ? Math.max(0, feeNumber(student[studentKey] ?? student[key] ?? currentStandards[key])) : 0,
                ]),
              );
              const total = feeDemandTotal(assignedHeads, demandValues);
              const paid = feeCollectionTotal(frontCollections);
              const balance = feeOutstandingTotal(assignedHeads, frontCollections, demandValues);
              const dueDate = student.fee_due_date || student.due_date || "2025-07-31";
              const today = new Date().toISOString().split("T")[0];
              const status = (total > 0 && balance <= 0)
                ? "Paid"
                : (dueDate && dueDate < today) ? "Overdue" : "Pending";

              return studentsApi.update(studentId, {
                ...student,
                fee_status: status,
                fees_paid: paid,
                fees_due: balance,
                fee_due_date: dueDate,
                fee_collections: feePayloadFields(frontCollections),
              });
            })
            .filter(Boolean);

          if (updates.length) {
            await Promise.all(updates);
            mutated = true;
          }
          try { localStorage.removeItem(LEGACY_STUDENT_FEE_COLLECTIONS_KEY); } catch { }
        }

        if (mutated && !cancelled) {
          const [studentsRes, feesRes] = await Promise.all([
            studentsApi.list(),
            feesApi.list(),
          ]);
          if (cancelled) return;
          if (Array.isArray(studentsRes?.students)) setStudents(studentsRes.students);
          if (Array.isArray(feesRes?.fees)) setFees(feesRes.fees);
        }
      } catch (err) {
        console.warn("Legacy fee storage migration failed:", err.message);
      } finally {
        if (!cancelled) setFeeStorageMigrationChecked(true);
      }
    })();

    return () => { cancelled = true; };
  }, [loading, feeStorageMigrationChecked, fees, students]);

  useEffect(() => {
    if (!perms.pages.includes(page)) setPage("dashboard");
  }, [role]);

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <GlobalStyles />
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          height: "100vh", background: "#f0f2f7", flexDirection: "column", gap: 16
        }}>
          <div style={{ fontSize: 48 }}>🏛️</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
            Vidyasagar University ERP
          </div>
          <div style={{ fontSize: 13, color: "#64748b" }}>Loading data from database…</div>
          <div style={{ width: 200, height: 4, background: "#e2e5ef", borderRadius: 3, overflow: "hidden", marginTop: 8 }}>
            <div style={{ height: "100%", background: "#2563eb", borderRadius: 3, animation: "pulse 1.2s ease-in-out infinite", width: "60%" }} />
          </div>
        </div>
      </>
    );
  }

  const renderPage = () => {
    if (!perms.pages.includes(page)) return <AccessDenied page={PAGE_TITLES[page]} />;
    const p = { role, userName };
    switch (page) {
      case "dashboard": return <Dashboard setPage={setPage} students={students} staff={staff} exams={exams} fees={fees} courses={courses} depts={depts} alumni={alumni} {...p} />;
      case "students": return <Students students={students} setStudents={setStudents} depts={depts} {...p} />;
      case "departments": return <Departments depts={depts} setDepts={setDepts} students={students} staff={staff} pubs={pubs} {...p} />;
      case "staff": return <Staff staff={staff} setStaff={setStaff} pubs={pubs} depts={depts} {...p} />;
      case "courses": return <Courses courses={courses} setCourses={setCourses} staff={staff} students={students} depts={depts} {...p} />;
      case "exams": return <Exams exams={exams} setExams={setExams} students={students} depts={depts} {...p} />;
      case "attendance": return <Attendance students={students} courses={courses} depts={depts} {...p} />;
      case "fees": return <Fees fees={fees} setFees={setFees} students={students} setStudents={setStudents} depts={depts} role={role} {...p} />;
      case "transport": return <Transport routes={routes} setRoutes={setRoutes} students={students} {...p} />;
      case "certificates": return <Certificates students={students} {...p} />;
      case "publications": return <Publications pubs={pubs} setPubs={setPubs} staff={staff} setStaff={setStaff} {...p} />;
      case "aicte": return <AICTEModule students={students} staff={staff} {...p} />;
      case "reports": return <Reports {...p} />;
      case "alumni": return <Alumni alumni={alumni} setAlumni={setAlumni} students={students} depts={depts} {...p} />;
      case "batches": return <Batches students={students} depts={depts} {...p} />;
      default: return <Dashboard setPage={setPage} students={students} staff={staff} exams={exams} fees={fees} courses={courses} depts={depts} alumni={alumni} {...p} />;
    }
  };

  const initials = userName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <GlobalStyles />
      <ToastManager />
      <div className="erp">
        <div className="sb">
          <div className="sb-brand">
            <div className="sb-tag">DEEMED UNIV.</div>
            <div className="sb-name">Vidyasagar University</div>
            <div className="sb-sub">Integrated ERP · v5.0 · AY 2025–26</div>
          </div>
          <div className="sb-nav">
            {NAV.map(sec => {
              const visible = sec.items.filter(i => perms.pages.includes(i.id));
              if (!visible.length) return null;
              return (
                <div key={sec.sec}>
                  <div className="sb-sec">{sec.sec}</div>
                  {visible.map(item => (
                    <div key={item.id} className={"sb-item" + (page === item.id ? " on" : "")} onClick={() => setPage(item.id)}>
                      <span className="sb-icon">{item.ico}</span>
                      {item.lbl}
                      {item.id === "aicte" && <span className="sb-badge">3</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="sb-foot">
            <div className="sb-user">
              <div className="sb-avatar">{initials}</div>
              <div><div className="sb-uname">{userName}</div><div className="sb-urole">{role}</div></div>
            </div>
            {onLogout && (
              <button onClick={onLogout} style={{ width: "100%", background: "var(--red-dim)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, padding: "8px", borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "all var(--transition)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                🚪 Logout
              </button>
            )}
          </div>
        </div>
        <div className="main">
          <div className="topbar">
            <div className="tb-title">{PAGE_TITLES[page] || "ERP"}</div>
            {DEMO_MODE && <span className="badge b-purple">Demo Data</span>}
            <GlobalSearch students={students} staff={staff} courses={courses} setPage={setPage} />
            {!DEMO_MODE && <button className="tb-btn" onClick={() => setShowImport(true)}>📥 Import</button>}
            {!DEMO_MODE && <button className="tb-btn" onClick={() => setShowExport(true)}>📤 Export</button>}
            <div className="tb-notif">
              <button className="tb-btn accent" onClick={() => setShowAlerts(true)}>🔔 {alerts.length} Alert{alerts.length === 1 ? "" : "s"}</button>
              <div className="tb-dot" />
            </div>
          </div>
          <div className="content">
            {renderPage()}
          </div>
        </div>
      </div>
      {showExport && <ExportModal onClose={() => setShowExport(false)} students={students} staff={staff} courses={courses} />}
      {showImport && (<ImportModal onClose={() => setShowImport(false)} setStudents={setStudents} setStaff={setStaff} setCourses={setCourses} setExams={setExams} setFees={setFees} setRoutes={setRoutes} depts={depts} />)}
      {showAlerts && <AlertsModal onClose={() => setShowAlerts(false)} alerts={alerts} setAlerts={setAlerts} canEdit={perms.canEdit} />}
    </>
  );
}
