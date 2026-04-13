// // components/Sidebar.jsx
// import React from 'react';
// import { motion } from 'framer-motion';

// const NAV_ITEMS = [
//   { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
//   { id: 'map',       icon: '◉', label: 'Threat Map' },
//   { id: 'sessions',  icon: '⌥', label: 'Sessions' },
//   { id: 'analytics', icon: '◎', label: 'Analytics' },
// ];

// export default function Sidebar({ active, onNav, collapsed, onToggle, stats }) {
//   return (
//     <aside className="sidebar">
//       {/* Logo */}
//       <div style={s.logo}>
//         <div style={s.logoMark}>
//           <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
//             <polygon points="13,1 25,7 25,19 13,25 1,19 1,7" fill="#4361ee" opacity="0.12" />
//             <polygon points="13,1 25,7 25,19 13,25 1,19 1,7" fill="none" stroke="#4361ee" strokeWidth="1.6"/>
//             <circle cx="13" cy="13" r="3.5" fill="#4361ee"/>
//           </svg>
//         </div>
//         <div style={s.logoText}>
//           <div style={s.logoMain}>HexWatch</div>
//           <div style={s.logoSub}>Honeypot IDS</div>
//         </div>
//       </div>

//       {/* Nav */}
//       <nav style={s.nav}>
//         {NAV_ITEMS.map(item => (
//           <button
//             key={item.id}
//             style={{ ...s.navBtn, ...(active === item.id ? s.navBtnActive : {}) }}
//             onClick={() => onNav(item.id)}
//             title={item.label}
//           >
//             <span style={{ ...s.navIcon, ...(active === item.id ? s.navIconActive : {}) }}>
//               {item.icon}
//             </span>
//             <span style={s.navLabel}>{item.label}</span>
//             {active === item.id && (
//               <motion.div layoutId="nav-indicator" style={s.indicator} />
//             )}
//           </button>
//         ))}
//       </nav>

//       {/* Mini stats */}
//       {stats && (
//         <div style={s.statsBox}>
//           <div style={s.statsTitle}>Live Stats</div>
//           <MiniStat label="Attacks"    value={stats.totalAttacks ?? 0}            color="#e8393a" />
//           <MiniStat label="Unique IPs" value={stats.uniqueIPs ?? 0}               color="#4361ee" />
//           <MiniStat label="Sessions"   value={stats.activeSessions?.length ?? 0}  color="#7048e8" />
//         </div>
//       )}

//       {/* Collapse button */}
//       <button style={s.collapseBtn} onClick={onToggle} title="Toggle sidebar">
//         <span style={{ fontSize: 11 }}>◀</span>
//         <span style={s.collapseLabel}>Collapse</span>
//       </button>
//     </aside>
//   );
// }

// function MiniStat({ label, value, color }) {
//   return (
//     <div style={s.statRow}>
//       <span style={{ ...s.statDot, background: color }} />
//       <span style={s.statLabel}>{label}</span>
//       <span style={{ ...s.statVal, color }}>{value?.toLocaleString()}</span>
//     </div>
//   );
// }

// const s = {
//   logo: {
//     display: 'flex', alignItems: 'center', gap: 11,
//     padding: '14px 18px 13px',
//     borderBottom: '1px solid var(--border-soft)',
//     flexShrink: 0, overflow: 'hidden', whiteSpace: 'nowrap',
//   },
//   logoMark: { flexShrink: 0 },
//   logoText: { overflow: 'hidden' },
//   logoMain: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 0.2, whiteSpace: 'nowrap' },
//   logoSub:  { fontSize: 9,  color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', whiteSpace: 'nowrap' },

//   nav: { flex: 1, padding: '8px 8px', overflow: 'hidden' },
//   navBtn: {
//     width: '100%', display: 'flex', alignItems: 'center', gap: 11,
//     padding: '9px 10px', border: 'none', background: 'transparent',
//     color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: 'var(--radius-sm)',
//     fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500,
//     transition: 'background 0.15s, color 0.15s',
//     textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden',
//     position: 'relative', marginBottom: 2,
//   },
//   navBtnActive: { color: 'var(--accent)', background: 'var(--accent-light)' },
//   navIcon: {
//     width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
//     borderRadius: 'var(--radius-xs)', background: 'var(--bg)',
//     fontSize: 16, flexShrink: 0, transition: 'background 0.15s',
//   },
//   navIconActive: { background: 'var(--accent-light)' },
//   navLabel: { fontSize: 13, fontWeight: 500, overflow: 'hidden' },
//   indicator: {
//     position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
//     width: 3, height: 18, background: 'var(--accent)', borderRadius: 2,
//   },

//   statsBox: {
//     padding: '12px 14px',
//     borderTop: '1px solid var(--border-soft)',
//     overflow: 'hidden', whiteSpace: 'nowrap',
//   },
//   statsTitle: { fontSize: 9, fontWeight: 700, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 9, textTransform: 'uppercase' },
//   statRow:  { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 },
//   statDot:  { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
//   statLabel:{ flex: 1, fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden' },
//   statVal:  { fontSize: 13, fontWeight: 700 },

//   collapseBtn: {
//     display: 'flex', alignItems: 'center', gap: 8,
//     padding: '11px 18px', border: 'none', borderTop: '1px solid var(--border-soft)',
//     background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)',
//     fontFamily: 'var(--font)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', width: '100%',
//   },
//   collapseLabel: { fontSize: 12, color: 'var(--text-muted)' },
// };




import React, { useState } from 'react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
{ id: 'dashboard', icon: '⊞', label: 'Dashboard' },
{ id: 'map',       icon: '🌍', label: 'Threat Map' },
{ id: 'sessions',  icon: '💻', label: 'Sessions' },
{ id: 'analytics', icon: '📊', label: 'Analytics' },
];

export default function Sidebar({ active, onNav, collapsed, onToggle, stats }) {
const [hovered, setHovered] = useState(false);

const isExpanded = hovered || !collapsed;

return (
<aside
style={{
...s.sidebar,
width: isExpanded ? 220 : 70
}}
onMouseEnter={() => setHovered(true)}
onMouseLeave={() => setHovered(false)}
>


  {/* LOGO */}
  <div style={s.logo}>
    <div style={s.logoMark}>⬢</div>

    {isExpanded && (
      <div style={s.logoText}>
        <div style={s.logoMain}>HexWatch</div>
        <div style={s.logoSub}>Honeypot IDS</div>
      </div>
    )}
  </div>

  {/* NAV */}
  <nav style={s.nav}>
    {NAV_ITEMS.map(item => (
      <button
        key={item.id}
        style={{
          ...s.navBtn,
          ...(active === item.id ? s.navBtnActive : {})
        }}
        onClick={() => onNav(item.id)}
      >
        <span style={{
          ...s.navIcon,
          ...(active === item.id ? s.navIconActive : {})
        }}>
          {item.icon}
        </span>

        {isExpanded && (
          <span style={s.navLabel}>{item.label}</span>
        )}

        {active === item.id && (
          <motion.div layoutId="nav-indicator" style={s.indicator} />
        )}
      </button>
    ))}
  </nav>

  {/* STATS */}
  {stats && isExpanded && (
    <div style={s.statsBox}>
      <div style={s.statsTitle}>LIVE STATS</div>

      <MiniStat label="Attacks" value={stats.totalAttacks ?? 0} color="#ff4d4f" />
      <MiniStat label="IPs" value={stats.uniqueIPs ?? 0} color="#4f6ef7" />
      <MiniStat label="Sessions" value={stats.activeSessions?.length ?? 0} color="#a78bfa" />
    </div>
  )}

  {/* COLLAPSE BUTTON */}
  {isExpanded && (
    <button style={s.collapseBtn} onClick={onToggle}>
      ◀ Collapse
    </button>
  )}
</aside>


);
}

function MiniStat({ label, value, color }) {
return ( <div style={s.statRow}>
<span style={{ ...s.statDot, background: color }} /> <span style={s.statLabel}>{label}</span>
<span style={{ ...s.statVal, color }}>{value}</span> </div>
);
}

const s = {
sidebar: {
background: '#0a0f1c',
borderRight: '1px solid #1f2a44',
display: 'flex',
flexDirection: 'column',
height: '100vh',
transition: 'width 0.3s ease'
},

logo: {
display: 'flex',
alignItems: 'center',
gap: 12,
padding: 16,
borderBottom: '1px solid #1f2a44'
},

logoMark: {
fontSize: 22,
color: '#00ffcc'
},

logoMain: {
fontSize: 16,
fontWeight: 'bold',
color: '#ffffff'
},

logoSub: {
fontSize: 11,
color: '#94a3b8'
},

nav: {
flex: 1,
padding: 10
},

navBtn: {
width: '100%',
display: 'flex',
alignItems: 'center',
gap: 12,
padding: '12px',
marginBottom: 6,
border: 'none',
background: 'transparent',
color: '#94a3b8',
cursor: 'pointer',
borderRadius: 8,
fontSize: 15,
transition: 'all 0.25s ease',
position: 'relative'
},

navBtnActive: {
background: '#111a2e',
color: '#00ffcc',
boxShadow: '0 0 10px #00ffcc22'
},

navIcon: {
fontSize: 18,
minWidth: 24,
textAlign: 'center'
},

navIconActive: {
color: '#00ffcc'
},

navLabel: {
fontSize: 15,
fontWeight: 600
},

indicator: {
position: 'absolute',
right: 6,
top: '50%',
transform: 'translateY(-50%)',
width: 4,
height: 20,
background: '#00ffcc',
borderRadius: 4
},

statsBox: {
padding: 14,
borderTop: '1px solid #1f2a44'
},

statsTitle: {
fontSize: 11,
color: '#64748b',
marginBottom: 10,
letterSpacing: 1
},

statRow: {
display: 'flex',
alignItems: 'center',
gap: 8,
marginBottom: 8
},

statDot: {
width: 8,
height: 8,
borderRadius: '50%'
},

statLabel: {
flex: 1,
fontSize: 13,
color: '#cbd5f5'
},

statVal: {
fontSize: 14,
fontWeight: 'bold'
},

collapseBtn: {
padding: 14,
borderTop: '1px solid #1f2a44',
background: 'transparent',
color: '#94a3b8',
border: 'none',
cursor: 'pointer',
fontSize: 13
}
};
