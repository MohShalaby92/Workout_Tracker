import { useState, useEffect, useCallback } from "react";

// ============================================================
// TRAIN TRACK - FITNESS TRACKER PROTOTYPE
// Coach Side + Client Side | Light & Dark Themes
// ============================================================

// --- DATA STORE ---
const INITIAL_DATA = {
  athlete: {
    name: "Mohamed", age: 33, height: 175, weight: 90,
    experience: "3+ years CrossFit", frequency: "4-5x/week, 1.5-2hrs",
    email: "mohamed@example.com", phone: "01009522073",
    gym: "Tunnelvision", speciality: "Crossfit",
    certificates: "Medical Certificate of Fitness"
  },
  prs: [
    { id: 1, movement: "Clean", kg: 80, lb: 176 },
    { id: 2, movement: "Squat Clean", kg: 79.4, lb: 175 },
    { id: 3, movement: "Back Squat", kg: 150, lb: 305 },
    { id: 4, movement: "Front Squat", kg: 102, lb: 225 },
    { id: 5, movement: "Clean & Jerk", kg: 70.3, lb: 155 },
    { id: 6, movement: "Strict Press", kg: 47.6, lb: 105 },
    { id: 7, movement: "Push Press", kg: 70, lb: 155 },
    { id: 8, movement: "Bench Press", kg: 80, lb: 175 },
    { id: 9, movement: "Power Snatch", kg: 56.7, lb: 125 },
    { id: 10, movement: "Squat Snatch", kg: 47.6, lb: 105 },
    { id: 11, movement: "Deadlift", kg: 150, lb: 330 },
    { id: 12, movement: "Plank", kg: "2:30", lb: "N/A" },
  ],
  injuries: [
    { id: 1, name: "Right ring finger fracture", area: "Right Hand", date: "Dec 2025", status: "Recovering", avoid: "Heavy grip without tape", notes: "Dr cleared for normal pressure. Test gradually." },
    { id: 2, name: "Left ulna nonunion", area: "Left Forearm", date: "Chronic", status: "Active", avoid: "Dips, butterfly swings, kipping", notes: "Well-aligned with metal plate. Only hurts on specific movements." },
  ],
  skills: [
    { id: 1, name: "High Volume Toes to Bar", status: "in-progress", current: "2-3 reps", notes: "Focus on kip timing and grip endurance" },
    { id: 2, name: "Double Unders", status: "locked", current: "Not achieved", notes: "Practice single-double transitions" },
    { id: 3, name: "Butterfly Pull-ups", status: "blocked", current: "Blocked by injury", notes: "Avoid due to ulna nonunion" },
    { id: 4, name: "Muscle Ups", status: "locked", current: "Not achieved", notes: "Build strict pull-up and dip strength" },
    { id: 5, name: "Kipping HSPU", status: "locked", current: "Not achieved", notes: "Develop strict HSPU first" },
    { id: 6, name: "Handstand Walk", status: "locked", current: "Not achieved", notes: "Progress through wall holds" },
  ],
  programs: [
    { id: 1, name: "Strength Builder", type: "Ongoing", desc: "Focus on Olympic lifts and squat variations", exercises: 24, completed: 8 },
    { id: 2, name: "Skill Work", type: "Template", desc: "Gymnastics and skill progressions", exercises: 16, completed: 3 },
    { id: 3, name: "MetCon Prep", type: "Standard", desc: "Conditioning and WOD preparation", exercises: 32, completed: 12 },
  ],
  workouts: {
    "2026-03-28": [
      { id: 1, program: "Strength Builder", section: "A", title: "Warm-Up", content: "3 Rounds:\n500m Row\n10 PVC Pass-throughs\n10 Air Squats\n5 Inch Worms", logged: false },
      { id: 2, program: "Strength Builder", section: "B", title: "Olympic Lifting", content: "SQUAT CLEAN:\nTall Clean: 3x3 reps\nClean Complex: Build to heavy in 5 sets\n2 Clean Grip DL + 2 Hang Clean Below Knee\nFRONT SQUAT:\n4x5 reps @70-75%", logged: false },
      { id: 3, program: "Strength Builder", section: "C", title: "Accessory", content: "3-4 Sets:\n12 DB Romanian Deadlifts\n10 Weighted Step-ups (each leg)\n15 GHD Hip Extensions\n1 min Plank Hold", logged: true },
    ]
  },
  videos: [
    { id: 1, title: "Squat Clean Technique", link: "https://youtube.com/watch?v=example1", category: "Olympic Lifting" },
    { id: 2, title: "Double Under Progression", link: "https://youtube.com/watch?v=example2", category: "Skills" },
  ],
  clients: [
    { id: 1, name: "Mohamed", email: "mohamed@example.com", status: "active", programs: 3, lastActive: "Today" },
    { id: 2, name: "Sara Ahmed", email: "sara@example.com", status: "active", programs: 2, lastActive: "Yesterday" },
    { id: 3, name: "Omar Hassan", email: "omar@example.com", status: "pending", programs: 0, lastActive: "N/A" },
  ]
};

// --- ICONS (inline SVG components) ---
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    programs: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/></>,
    clients: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
    library: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
    tutorials: <><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></>,
    team: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
    profile: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    train: <><path d="M6.5 6.5h11M6 12h12M17.5 17.5h-11"/><rect x="3" y="3" width="18" height="18" rx="2"/></>,
    track: <><path d="M18 20V10M12 20V4M6 20v-6"/></>,
    bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    chevDown: <><polyline points="6 9 12 15 18 9"/></>,
    chevUp: <><polyline points="18 15 12 9 6 15"/></>,
    chevLeft: <><polyline points="15 18 9 12 15 6"/></>,
    chevRight: <><polyline points="9 18 15 12 9 6"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    check: <><polyline points="20 6 9 17 4 12"/></>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    alert: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    injury: <><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/></>,
    trophy: <><path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 22V12M14 22V12"/><path d="M6 2h12v7a6 6 0 01-12 0V2z"/></>,
    target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    video: <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    moon: <><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></>,
    sun: <><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>,
    link: <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>,
    unlock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 019.9-1"/></>,
    blocked: <><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// --- THEME ---
const themes = {
  light: {
    bg: "#F3F4F6", card: "#FFFFFF", sidebar: "#FFFFFF", text: "#1F2937", textSecondary: "#6B7280",
    border: "#E5E7EB", accent: "#000000", accentText: "#FFFFFF", teal: "#10B981",
    red: "#EF4444", orange: "#F59E0B", cardHover: "#F9FAFB", inputBg: "#F5F5F5",
    sidebarActive: "#F3F4F6", modalOverlay: "rgba(0,0,0,0.4)", progressBg: "#E5E7EB",
    progressFill: "#1F2937", tabActive: "#000000", tabActiveText: "#FFFFFF",
    tabInactive: "transparent", tabInactiveText: "#6B7280",
  },
  dark: {
    bg: "#0F1117", card: "#1A1D2E", sidebar: "#141620", text: "#E5E7EB", textSecondary: "#9CA3AF",
    border: "#2D3148", accent: "#2DD4A8", accentText: "#0F1117", teal: "#2DD4A8",
    red: "#EF4444", orange: "#F59E0B", cardHover: "#242838", inputBg: "#242838",
    sidebarActive: "#242838", modalOverlay: "rgba(0,0,0,0.7)", progressBg: "#2D3148",
    progressFill: "#2DD4A8", tabActive: "#2DD4A8", tabActiveText: "#0F1117",
    tabInactive: "transparent", tabInactiveText: "#9CA3AF",
  }
};

// --- DATE HELPERS ---
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getWeekDates(date) {
  const d = new Date(date);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(start);
    dd.setDate(start.getDate() + i);
    return dd;
  });
}

function fmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ============================================================
// COACH SIDE COMPONENTS
// ============================================================

function CoachDashboard({ t, data }) {
  const stats = [
    { label: "WODs Done", value: 12, pct: "+8%" },
    { label: "Logs Today", value: 28, pct: "+15%" },
    { label: "Assigned Today", value: 3, pct: "100%" },
    { label: "Not Assigned", value: 0, pct: "0%" },
    { label: "Active Clients", value: data.clients.filter(c=>c.status==='active').length, pct: "" },
  ];
  const [selDate, setSelDate] = useState(new Date());
  const week = getWeekDates(selDate);
  const today = fmt(new Date());

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: t.card, borderRadius: 12, padding: "16px 18px", border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: t.text }}>{s.value}</div>
            <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 2 }}>{s.label}</div>
            {s.pct && <div style={{ fontSize: 11, color: t.teal, marginTop: 4 }}>{s.pct}</div>}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div style={{ background: t.card, borderRadius: 12, padding: 20, border: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: t.text }}>Clients Daily Log</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => { const d = new Date(selDate); d.setDate(d.getDate()-7); setSelDate(d); }} style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecondary }}><Icon name="chevLeft" size={16}/></button>
              <button onClick={() => { const d = new Date(selDate); d.setDate(d.getDate()+7); setSelDate(d); }} style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecondary }}><Icon name="chevRight" size={16}/></button>
              <Icon name="calendar" size={16} color={t.teal}/>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center" }}>
            {week.map((d, i) => {
              const isToday = fmt(d) === today;
              return (
                <div key={i} style={{ padding: "6px 0", borderRadius: 8, background: isToday ? t.teal : "transparent", cursor: "pointer" }} onClick={() => setSelDate(d)}>
                  <div style={{ fontSize: 10, color: isToday ? t.accentText : t.textSecondary, textTransform: "uppercase" }}>{DAYS[d.getDay()]}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: isToday ? t.accentText : t.text, marginTop: 2 }}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 20, textAlign: "center", color: t.textSecondary, fontSize: 13, padding: 20 }}>
            <div style={{ fontSize: 11, opacity: 0.6 }}>3 clients logged workouts today</div>
          </div>
        </div>
        <div style={{ background: t.card, borderRadius: 12, padding: 20, border: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: t.teal, borderBottom: `2px solid ${t.teal}`, paddingBottom: 4 }}>Needs Attention <span style={{ background: t.teal, color: t.accentText, borderRadius: 10, padding: "1px 6px", fontSize: 10, marginLeft: 4 }}>1</span></span>
            <span style={{ fontSize: 12, color: t.textSecondary }}>Daily Activity <span style={{ opacity: 0.5 }}>2</span></span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: t.red, marginBottom: 16 }}>
            <div style={{ height: "100%", width: "66%", borderRadius: 2, background: t.teal }}/>
          </div>
          <div style={{ fontSize: 13, color: t.textSecondary, textAlign: "center", padding: 16 }}>
            <div style={{ fontWeight: 600, color: t.text, marginBottom: 4 }}>Omar Hassan</div>
            <div style={{ fontSize: 11 }}>Pending invitation - no activity yet</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoachClients({ t, data }) {
  const [filter, setFilter] = useState("active");
  const [showInvite, setShowInvite] = useState(false);
  const filtered = data.clients.filter(c => filter === "all" || c.status === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: 0 }}>Clients</h2>
        <button onClick={() => setShowInvite(true)} style={{ background: t.accent, color: t.accentText, border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <Icon name="plus" size={14} color={t.accentText}/> Invite Client
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all","active","pending","archived"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? t.accent : "transparent", color: filter === f ? t.accentText : t.textSecondary, border: `1px solid ${filter === f ? t.accent : t.border}`, borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer", textTransform: "capitalize", fontWeight: filter === f ? 600 : 400 }}>{f}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(c => (
          <div key={c.id} style={{ background: t.card, borderRadius: 10, padding: "14px 18px", border: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.teal+"22", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: t.teal }}>{c.name.charAt(0)}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: t.text }}>{c.name}</div>
                <div style={{ fontSize: 11, color: t.textSecondary }}>{c.email}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 11, color: t.textSecondary }}>{c.programs} programs</span>
              <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 12, background: c.status === 'active' ? t.teal+"22" : t.orange+"22", color: c.status === 'active' ? t.teal : t.orange, fontWeight: 600, textTransform: "capitalize" }}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
      {showInvite && <Modal t={t} title="Invite Client" onClose={() => setShowInvite(false)}>
        <input placeholder="Email address" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
          <button onClick={() => setShowInvite(false)} style={{ background: "none", border: "none", color: t.textSecondary, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button style={{ background: t.accent, color: t.accentText, border: "none", borderRadius: 8, padding: "8px 24px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Invite</button>
        </div>
      </Modal>}
    </div>
  );
}

function CoachPrograms({ t, data }) {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: 0 }}>Programs</h2>
        <button onClick={() => setShowAdd(true)} style={{ background: t.accent, color: t.accentText, border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <Icon name="plus" size={14} color={t.accentText}/> Create Program
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {data.programs.map(p => (
          <div key={p.id} style={{ background: t.card, borderRadius: 12, padding: 18, border: `1px solid ${t.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: t.text }}>{p.name}</div>
                <div style={{ fontSize: 11, color: t.textSecondary, marginTop: 2 }}>{p.type} Program</div>
              </div>
              <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 12, background: t.teal+"22", color: t.teal, fontWeight: 600 }}>{p.exercises} exercises</span>
            </div>
            <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 8 }}>{p.desc}</div>
            <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: t.progressBg }}>
              <div style={{ height: "100%", borderRadius: 2, background: t.progressFill, width: `${(p.completed/p.exercises)*100}%`, transition: "width 0.3s" }}/>
            </div>
            <div style={{ fontSize: 10, color: t.textSecondary, marginTop: 4 }}>{p.completed}/{p.exercises} completed</div>
          </div>
        ))}
      </div>
      {showAdd && <Modal t={t} title="Add Program" onClose={() => setShowAdd(false)}>
        <input placeholder="Name" style={{ ...inputStyle(t), marginBottom: 10 }}/>
        <textarea placeholder="Description" rows={3} style={{ ...inputStyle(t), resize: "vertical", marginBottom: 10 }}/>
        <select style={{ ...inputStyle(t), marginBottom: 10 }}>
          <option>Template Program</option><option>Ongoing Program</option><option>Standard Program</option>
        </select>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", color: t.textSecondary, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button style={{ background: t.accent, color: t.accentText, border: "none", borderRadius: 8, padding: "8px 24px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Add</button>
        </div>
      </Modal>}
    </div>
  );
}

function CoachLibrary({ t, data }) {
  const [tab, setTab] = useState("video");
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", marginBottom: 20, border: `1px solid ${t.border}` }}>
        {["video","workout"].map(tb => (
          <button key={tb} onClick={() => setTab(tb)} style={{ flex: 1, padding: "12px 0", background: tab === tb ? t.tabActive : t.tabInactive, color: tab === tb ? t.tabActiveText : t.tabInactiveText, border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13, textTransform: "capitalize" }}>{tb === "video" ? "Video Library" : "Workout Library"}</button>
        ))}
      </div>
      {tab === "video" ? (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button onClick={() => setShowAddVideo(true)} style={{ background: t.accent, color: t.accentText, border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>+ Add Video</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
            {data.videos.map(v => (
              <div key={v.id} style={{ background: t.card, borderRadius: 10, border: `1px solid ${t.border}`, overflow: "hidden" }}>
                <div style={{ background: t.inputBg, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="video" size={32} color={t.textSecondary}/>
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: t.text }}>{v.title}</div>
                  <div style={{ fontSize: 11, color: t.teal, marginTop: 4 }}>{v.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button onClick={() => setShowAddExercise(true)} style={{ background: t.accent, color: t.accentText, border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>+ Add Template Exercise</button>
          </div>
          <div style={{ background: t.card, borderRadius: 10, padding: 24, border: `1px solid ${t.border}`, textAlign: "center", color: t.textSecondary }}>
            <Icon name="target" size={40} color={t.textSecondary}/>
            <div style={{ fontWeight: 600, fontSize: 15, color: t.text, marginTop: 12 }}>Build your exercise library</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Add template exercises with descriptions and video links</div>
          </div>
        </div>
      )}
      {showAddVideo && <Modal t={t} title="Add Video" onClose={() => setShowAddVideo(false)}>
        <input placeholder="Video Title" style={{ ...inputStyle(t), marginBottom: 10 }}/>
        <input placeholder="Enter YouTube or Vimeo link" style={{ ...inputStyle(t), marginBottom: 10 }}/>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <button onClick={() => setShowAddVideo(false)} style={{ background: "none", border: "none", color: t.textSecondary, cursor: "pointer" }}>Cancel</button>
          <button style={{ background: t.accent, color: t.accentText, border: "none", borderRadius: 8, padding: "8px 24px", fontWeight: 600, cursor: "pointer" }}>Add Video</button>
        </div>
      </Modal>}
      {showAddExercise && <Modal t={t} title="Add Template Exercise" onClose={() => setShowAddExercise(false)}>
        <input placeholder="Exercise Title" style={{ ...inputStyle(t), marginBottom: 10 }}/>
        <textarea placeholder="Enter exercise description" rows={4} style={{ ...inputStyle(t), resize: "vertical", marginBottom: 10 }}/>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 6 }}>Video Links</div>
        <button style={{ width: "100%", padding: 10, border: `1px dashed ${t.border}`, borderRadius: 8, background: "transparent", color: t.textSecondary, cursor: "pointer", fontSize: 12 }}>+ Add Video Link</button>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
          <button onClick={() => setShowAddExercise(false)} style={{ background: "none", border: "none", color: t.textSecondary, cursor: "pointer" }}>Cancel</button>
          <button style={{ background: t.accent, color: t.accentText, border: "none", borderRadius: 8, padding: "8px 24px", fontWeight: 600, cursor: "pointer" }}>Add Exercise</button>
        </div>
      </Modal>}
    </div>
  );
}

function CoachPRTracker({ t, data }) {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: 0 }}>PR Tracking & Analytics</h2>
        <button onClick={() => setShowAdd(true)} style={{ background: t.accent, color: t.accentText, border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>+ Add PR</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
        {data.prs.map(pr => (
          <div key={pr.id} style={{ background: t.card, borderRadius: 10, padding: 16, border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 12, color: t.textSecondary, marginBottom: 4 }}>{pr.movement}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: t.text }}>{typeof pr.kg === 'number' ? `${pr.kg} kg` : pr.kg}</div>
            {typeof pr.lb === 'number' && <div style={{ fontSize: 11, color: t.teal }}>{pr.lb} lb</div>}
          </div>
        ))}
      </div>
      <div style={{ background: t.card, borderRadius: 12, padding: 20, marginTop: 20, border: `1px solid ${t.border}` }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 12 }}>Strength Analysis</div>
        <div style={{ fontSize: 12, color: t.textSecondary, lineHeight: 1.7 }}>
          Back Squat and Deadlift are strong at 1.67x bodyweight. Olympic lifts are relatively lower, suggesting room for improvement in technique. The strict press to push press ratio (47.6 vs 70 kg) shows good power transfer but potential for more overhead strength. Squat snatch being lower than power snatch suggests overhead squat mobility work is needed.
        </div>
      </div>
      {showAdd && <Modal t={t} title="Add New PR" onClose={() => setShowAdd(false)}>
        <input placeholder="Movement name" style={{ ...inputStyle(t), marginBottom: 10 }}/>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <input placeholder="Weight (kg)" type="number" style={{ ...inputStyle(t), flex: 1 }}/>
          <input placeholder="Weight (lb)" type="number" style={{ ...inputStyle(t), flex: 1 }}/>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", color: t.textSecondary, cursor: "pointer" }}>Cancel</button>
          <button style={{ background: t.accent, color: t.accentText, border: "none", borderRadius: 8, padding: "8px 24px", fontWeight: 600, cursor: "pointer" }}>Save PR</button>
        </div>
      </Modal>}
    </div>
  );
}

function CoachInjuries({ t, data }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: 0 }}>Injuries & Limitations</h2>
        <button style={{ background: t.accent, color: t.accentText, border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>+ Add Injury</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.injuries.map(inj => (
          <div key={inj.id} style={{ background: t.card, borderRadius: 12, padding: 18, border: `1px solid ${t.border}`, borderLeft: `4px solid ${inj.status === 'Active' ? t.red : t.orange}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: t.text }}>{inj.name}</div>
                <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 2 }}>{inj.area} · {inj.date}</div>
              </div>
              <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 12, background: inj.status === 'Active' ? t.red+"22" : t.orange+"22", color: inj.status === 'Active' ? t.red : t.orange, fontWeight: 600 }}>{inj.status}</span>
            </div>
            <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 8, background: t.inputBg, padding: "8px 12px", borderRadius: 6 }}>
              <strong style={{ color: t.text }}>Avoid:</strong> {inj.avoid}
            </div>
            <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 6 }}>{inj.notes}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoachProfile({ t, data, dark, setDark }) {
  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", fontSize: 20, fontWeight: 700, color: t.text }}>Profile</h2>
      <div style={{ background: t.card, borderRadius: 12, padding: 24, border: `1px solid ${t.border}`, textAlign: "center", marginBottom: 16 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: t.teal+"22", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontWeight: 800, fontSize: 22, color: t.teal }}>M</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: t.text }}>{data.athlete.name}</div>
        <div style={{ fontSize: 12, color: t.textSecondary }}>{data.athlete.email}</div>
        <div style={{ fontSize: 12, color: t.textSecondary }}>{data.athlete.phone}</div>
      </div>
      {[
        { label: "Edit Profile", icon: "edit" },
        { label: "Change Password", icon: "lock" },
      ].map((item, i) => (
        <div key={i} style={{ background: t.card, borderRadius: 10, padding: "12px 16px", border: `1px solid ${t.border}`, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name={item.icon} size={16} color={t.textSecondary}/>
            <span style={{ fontSize: 14, color: t.text }}>{item.label}</span>
          </div>
          <Icon name="chevRight" size={16} color={t.textSecondary}/>
        </div>
      ))}
      <div style={{ background: t.card, borderRadius: 10, padding: "12px 16px", border: `1px solid ${t.border}`, marginTop: 16, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name={dark ? "moon" : "sun"} size={16} color={t.textSecondary}/>
          <span style={{ fontSize: 14, color: t.text }}>{dark ? "Dark" : "Light"} Mode</span>
        </div>
        <div onClick={() => setDark(!dark)} style={{ width: 44, height: 24, borderRadius: 12, background: dark ? t.teal : t.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: dark ? 22 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}/>
        </div>
      </div>
      <div style={{ background: t.red+"11", borderRadius: 10, padding: "12px 16px", border: `1px solid ${t.red}33`, marginTop: 16, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <Icon name="logout" size={16} color={t.red}/>
        <span style={{ fontSize: 14, color: t.red, fontWeight: 600 }}>Logout</span>
      </div>
    </div>
  );
}

// ============================================================
// CLIENT SIDE COMPONENTS
// ============================================================

function ClientTrain({ t, data }) {
  const [selDate, setSelDate] = useState(new Date());
  const [expanded, setExpanded] = useState({});
  const [logScreen, setLogScreen] = useState(null);
  const [logText, setLogText] = useState("");
  const week = getWeekDates(selDate);
  const today = fmt(new Date());
  const todayWorkouts = data.workouts[fmt(selDate)] || [];

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (logScreen) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => setLogScreen(null)} style={{ background: "none", border: "none", cursor: "pointer", color: t.text }}><Icon name="chevLeft" size={20}/></button>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: t.text }}>{logScreen.title} :</h3>
        </div>
        <div style={{ background: t.card, borderRadius: 10, padding: 16, border: `1px solid ${t.border}`, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: t.text, whiteSpace: "pre-line", lineHeight: 1.6 }}>{logScreen.content}</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 6 }}>Details <span style={{ fontWeight: 400, color: t.textSecondary }}>(Optional)</span></div>
        <textarea value={logText} onChange={e => setLogText(e.target.value)} placeholder="Details" rows={4} style={{ ...inputStyle(t), resize: "vertical", marginBottom: 16 }}/>
        <div style={{ fontSize: 13, color: t.textSecondary, marginBottom: 8 }}>Select file: <span style={{ float: "right", cursor: "pointer" }}>📎</span></div>
        <button style={{ width: "100%", padding: 14, background: t.accent, color: t.accentText, border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Log</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.teal+"22", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: t.teal }}>M</div>
          <div>
            <div style={{ fontSize: 11, color: t.textSecondary }}>Welcome,</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: t.text }}>Mohamed</div>
          </div>
        </div>
        <Icon name="bell" size={20} color={t.text}/>
      </div>

      <div style={{ background: t.card, borderRadius: 12, padding: 16, border: `1px solid ${t.border}`, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button onClick={() => { const d = new Date(selDate); d.setDate(d.getDate()-7); setSelDate(d); }} style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecondary }}><Icon name="chevLeft" size={16}/></button>
          <span style={{ fontWeight: 600, fontSize: 14, color: t.text }}>{MONTHS[selDate.getMonth()]} {selDate.getFullYear()}</span>
          <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 12, background: t.accent, color: t.accentText, fontWeight: 600 }}>Train Track</span>
          <button onClick={() => { const d = new Date(selDate); d.setDate(d.getDate()+7); setSelDate(d); }} style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecondary }}><Icon name="chevRight" size={16}/></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, textAlign: "center" }}>
          {week.map((d, i) => {
            const sel = fmt(d) === fmt(selDate);
            return (
              <div key={i} onClick={() => setSelDate(d)} style={{ padding: "8px 0", borderRadius: 10, background: sel ? t.accent : "transparent", cursor: "pointer" }}>
                <div style={{ fontSize: 9, color: sel ? t.accentText : t.textSecondary, textTransform: "uppercase" }}>{DAYS[d.getDay()]}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: sel ? t.accentText : t.text, marginTop: 2 }}>{d.getDate()}</div>
              </div>
            );
          })}
        </div>
      </div>

      {data.programs.map(prog => {
        const workouts = todayWorkouts.filter(w => w.program === prog.name);
        const isExpanded = expanded[prog.id];
        const completedCount = workouts.filter(w => w.logged).length;
        return (
          <div key={prog.id} style={{ background: t.card, borderRadius: 12, border: `1px solid ${t.border}`, marginBottom: 10, overflow: "hidden" }}>
            <div onClick={() => toggle(prog.id)} style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{prog.name}</span>
              <Icon name={isExpanded ? "chevUp" : "chevDown"} size={16} color={t.textSecondary}/>
            </div>
            {isExpanded && (
              <div style={{ padding: "0 16px 16px" }}>
                {workouts.length > 0 ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 12, color: t.textSecondary }}>Daily Progress</span>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${t.teal}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: t.teal }}>{completedCount}</div>
                    </div>
                    {workouts.map(w => (
                      <WorkoutCard key={w.id} w={w} t={t} onLog={() => setLogScreen(w)}/>
                    ))}
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: 20, color: t.textSecondary, fontSize: 12 }}>
                    No workout assigned for this date
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function WorkoutCard({ w, t, onLog }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
        <span style={{ fontSize: 13, color: t.text }}><strong>{w.section})</strong> {w.title}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name={open ? "chevUp" : "chevDown"} size={14} color={t.textSecondary}/>
          <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${w.logged ? t.teal : t.border}`, background: w.logged ? t.teal : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {w.logged && <Icon name="check" size={12} color={t.accentText}/>}
          </div>
        </div>
      </div>
      {open && (
        <div style={{ padding: "0 14px 14px" }}>
          <div style={{ fontSize: 12, color: t.textSecondary, whiteSpace: "pre-line", lineHeight: 1.7, marginBottom: 12, background: t.inputBg, padding: 12, borderRadius: 8 }}>{w.content}</div>
          <button onClick={onLog} style={{ width: "100%", padding: 12, background: t.accent, color: t.accentText, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Log</button>
          <div style={{ textAlign: "center", marginTop: 6, fontSize: 12, color: t.textSecondary, cursor: "pointer" }}>Mark as missed</div>
        </div>
      )}
    </div>
  );
}

function ClientTrack({ t, data }) {
  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 16, marginTop: 0 }}>Your Progress</h3>
      {data.programs.map(p => (
        <div key={p.id} style={{ background: t.card, borderRadius: 12, padding: 16, border: `1px solid ${t.border}`, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{p.name}</span>
            <span style={{ fontSize: 12, color: t.textSecondary }}>{p.completed}/{p.exercises} Exercises</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: t.progressBg, position: "relative" }}>
            <div style={{ height: "100%", borderRadius: 4, background: t.progressFill, width: `${(p.completed/p.exercises)*100}%`, transition: "width 0.3s" }}/>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: t.textSecondary, marginTop: 4 }}>
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>
      ))}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginTop: 24, marginBottom: 12 }}>Skills to Unlock</h3>
      {data.skills.map(s => (
        <div key={s.id} style={{ background: t.card, borderRadius: 10, padding: "12px 16px", border: `1px solid ${t.border}`, marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: s.status === 'in-progress' ? t.teal+"22" : s.status === 'blocked' ? t.red+"22" : t.progressBg }}>
            <Icon name={s.status === 'in-progress' ? "unlock" : s.status === 'blocked' ? "blocked" : "lock"} size={14}
              color={s.status === 'in-progress' ? t.teal : s.status === 'blocked' ? t.red : t.textSecondary}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{s.name}</div>
            <div style={{ fontSize: 11, color: t.textSecondary }}>{s.current}</div>
          </div>
          <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, fontWeight: 600, textTransform: "capitalize",
            background: s.status === 'in-progress' ? t.teal+"22" : s.status === 'blocked' ? t.red+"22" : t.progressBg,
            color: s.status === 'in-progress' ? t.teal : s.status === 'blocked' ? t.red : t.textSecondary }}>{s.status}</span>
        </div>
      ))}
    </div>
  );
}

function ClientProfile({ t, data, dark, setDark }) {
  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ textAlign: "center", fontSize: 16, fontWeight: 700, color: t.text, marginTop: 0 }}>Profile</h3>
      <div style={{ background: t.card, borderRadius: 12, padding: 20, border: `1px solid ${t.border}`, textAlign: "center", marginBottom: 16 }}>
        <div style={{ width: 50, height: 50, borderRadius: "50%", background: t.teal+"22", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontWeight: 800, fontSize: 20, color: t.teal }}>M</div>
        <div style={{ fontWeight: 700, fontSize: 16, color: t.text }}>{data.athlete.name}</div>
        <div style={{ fontSize: 12, color: t.textSecondary }}>{data.athlete.email}</div>
      </div>
      {["My Account", "Change Password", "Delete Account"].map((item, i) => (
        <div key={i} style={{ background: t.card, borderRadius: 10, padding: "12px 16px", border: `1px solid ${t.border}`, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: t.text }}>{item}</span>
          <Icon name="chevRight" size={14} color={t.textSecondary}/>
        </div>
      ))}
      <div style={{ background: t.card, borderRadius: 10, padding: "12px 16px", border: `1px solid ${t.border}`, marginTop: 12, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: t.text }}>{dark ? "Dark" : "Light"} Mode</span>
        <div onClick={() => setDark(!dark)} style={{ width: 40, height: 22, borderRadius: 11, background: dark ? t.teal : t.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: dark ? 20 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}/>
        </div>
      </div>
      <div style={{ background: t.card, borderRadius: 10, padding: "12px 16px", border: `1px solid ${t.border}`, marginTop: 12, textAlign: "center" }}>
        <span style={{ fontSize: 13, color: t.red, fontWeight: 600 }}>Logout</span>
      </div>
      <div style={{ background: t.card, borderRadius: 10, padding: "12px 16px", border: `1px solid ${t.border}`, marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon name="link" size={14} color={t.textSecondary}/>
        <span style={{ fontSize: 13, color: t.textSecondary }}>Link My Coach Account</span>
      </div>
    </div>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================

function Modal({ t, title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: t.modalOverlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: t.card, borderRadius: 14, padding: 24, width: "90%", maxWidth: 440, maxHeight: "80vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: t.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecondary }}><Icon name="x" size={18}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputStyle = (t) => ({
  width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${t.border}`,
  background: t.inputBg, color: t.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit"
});

// ============================================================
// MAIN APP
// ============================================================

export default function App() {
  const [mode, setMode] = useState("coach"); // "coach" or "client"
  const [dark, setDark] = useState(true);
  const [coachNav, setCoachNav] = useState("dashboard");
  const [clientNav, setClientNav] = useState("train");
  const t = themes[dark ? "dark" : "light"];
  const data = INITIAL_DATA;

  const coachNavItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "programs", label: "Programs", icon: "programs" },
    { id: "clients", label: "Clients", icon: "clients" },
    { id: "library", label: "Library", icon: "library" },
    { id: "prs", label: "PR Tracker", icon: "trophy" },
    { id: "injuries", label: "Injuries", icon: "alert" },
    { id: "profile", label: "Profile", icon: "profile" },
  ];

  const clientNavItems = [
    { id: "train", label: "Train", icon: "train" },
    { id: "track", label: "Track", icon: "track" },
    { id: "profile", label: "Profile", icon: "profile" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif", background: t.bg, minHeight: "100vh", color: t.text }}>
      {/* Mode Switcher */}
      <div style={{ position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 999, display: "flex", borderRadius: 10, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", border: `1px solid ${t.border}` }}>
        {["coach", "client"].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ padding: "8px 20px", background: mode === m ? t.teal : t.card, color: mode === m ? t.accentText : t.textSecondary, border: "none", fontWeight: 700, cursor: "pointer", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
            {m}
          </button>
        ))}
      </div>

      {mode === "coach" ? (
        /* ===== COACH LAYOUT ===== */
        <div style={{ display: "flex", minHeight: "100vh" }}>
          {/* Sidebar */}
          <div style={{ width: 200, background: t.sidebar, borderRight: `1px solid ${t.border}`, padding: "20px 0", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
            <div style={{ padding: "0 20px 24px", borderBottom: `1px solid ${t.border}`, marginBottom: 12 }}>
              <div style={{ borderTop: `3px solid ${t.text}`, paddingTop: 6 }}>
                <div style={{ fontWeight: 900, fontSize: 22, lineHeight: 1.1, color: t.text }}>train</div>
                <div style={{ fontWeight: 900, fontSize: 22, lineHeight: 1.1, color: t.text }}>track</div>
              </div>
              <div style={{ borderTop: `3px solid ${t.text}`, marginTop: 6 }}/>
            </div>
            {coachNavItems.map(item => (
              <div key={item.id} onClick={() => setCoachNav(item.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", cursor: "pointer", fontSize: 13,
                  background: coachNav === item.id ? t.sidebarActive : "transparent",
                  color: coachNav === item.id ? t.text : t.textSecondary,
                  fontWeight: coachNav === item.id ? 700 : 400,
                  borderLeft: coachNav === item.id ? `3px solid ${t.teal}` : "3px solid transparent",
                  transition: "all 0.15s" }}>
                <Icon name={item.icon} size={16}/> {item.label}
              </div>
            ))}
          </div>
          {/* Main Content */}
          <div style={{ flex: 1, padding: "56px 28px 28px", overflowY: "auto" }}>
            {coachNav === "dashboard" && <CoachDashboard t={t} data={data}/>}
            {coachNav === "programs" && <CoachPrograms t={t} data={data}/>}
            {coachNav === "clients" && <CoachClients t={t} data={data}/>}
            {coachNav === "library" && <CoachLibrary t={t} data={data}/>}
            {coachNav === "prs" && <CoachPRTracker t={t} data={data}/>}
            {coachNav === "injuries" && <CoachInjuries t={t} data={data}/>}
            {coachNav === "profile" && <CoachProfile t={t} data={data} dark={dark} setDark={setDark}/>}
          </div>
        </div>
      ) : (
        /* ===== CLIENT LAYOUT (Mobile Frame) ===== */
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "56px 20px 20px" }}>
          <div style={{ width: 375, height: 740, background: t.card, borderRadius: 28, border: `1px solid ${t.border}`, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}>
            {/* Phone notch */}
            <div style={{ height: 36, background: t.card, display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
              <div style={{ width: 120, height: 5, borderRadius: 3, background: t.border }}/>
            </div>
            {/* Content */}
            <div style={{ flex: 1, overflow: "auto", background: t.bg }}>
              {clientNav === "train" && <ClientTrain t={t} data={data}/>}
              {clientNav === "track" && <ClientTrack t={t} data={data}/>}
              {clientNav === "profile" && <ClientProfile t={t} data={data} dark={dark} setDark={setDark}/>}
            </div>
            {/* Bottom Nav */}
            <div style={{ height: 56, background: t.card, borderTop: `1px solid ${t.border}`, display: "flex", flexShrink: 0 }}>
              {clientNavItems.map(item => (
                <div key={item.id} onClick={() => setClientNav(item.id)}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    color: clientNav === item.id ? t.accent : t.textSecondary, transition: "color 0.15s" }}>
                  <Icon name={item.icon} size={20} color={clientNav === item.id ? t.accent : t.textSecondary}/>
                  <span style={{ fontSize: 10, marginTop: 3, fontWeight: clientNav === item.id ? 700 : 400 }}>{item.label}</span>
                </div>
              ))}
            </div>
            {/* Home indicator */}
            <div style={{ height: 20, background: t.card, display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
              <div style={{ width: 100, height: 4, borderRadius: 2, background: t.border }}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
