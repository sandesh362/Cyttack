// // components/MetricsPanel.jsx
// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { flagEmoji } from '../utils/helpers';

// function StatCard({ label, value, color, sub, icon }) {
//   return (
//     <motion.div
//       style={{ ...s.card, borderTop: `3px solid ${color}` }}
//       whileHover={{ background: '#1c2333' }}
//       transition={{ duration: 0.14 }}
//     >
//       <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
//         <div>
//           <div style={{ ...s.cardVal, color }}>{value ?? '—'}</div>
//           <div style={s.cardLabel}>{label}</div>
//           {sub && <div style={s.cardSub}>{sub}</div>}
//         </div>
//         <div style={{ ...s.iconBox, background: color + '18', color }}>{icon}</div>
//       </div>
//     </motion.div>
//   );
// }

// function HoverBar({ item, index, max, color, renderItem }) {
//   const [hov, setHov] = useState(false);
//   const pct = Math.round(((item.count || 0) / (max || 1)) * 100);
//   const opacity = Math.max(0.35, 1 - index * 0.08);
//   const label = renderItem ? renderItem(item) : item.name;

//   return (
//     <div style={{ ...s.topRow, position: 'relative' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
//       <span style={s.rank}>#{index + 1}</span>
//       <div style={s.barWrap}>
//         {/* Track */}
//         <div style={{ position: 'absolute', inset: 0, background: color + '15', borderRadius: 4 }} />
//         {/* Fill */}
//         <div style={{
//           ...s.barFill, width: `${pct}%`, background: color, opacity,
//           boxShadow: hov ? `0 2px 8px ${color}44` : 'none',
//         }} />
//         {/* Label — white on fill, colored outside */}
//         <span style={{
//           ...s.barLabel,
//           color: pct > 25 ? '#ffffff' : color,
//           fontWeight: 600,
//           textShadow: pct > 25 ? '0 1px 3px rgba(0,0,0,0.6)' : 'none',
//           zIndex: 2,
//         }}>
//           {label}
//         </span>
//       </div>
//       <span style={{ ...s.barCount, color }}>{item.count}</span>
//       {hov && (
//         <div style={{
//           position: 'absolute', right: 36, top: '50%', transform: 'translateY(-50%)',
//           background: '#1c2333', border: `1px solid ${color}44`,
//           borderRadius: 7, padding: '5px 12px', zIndex: 20,
//           boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
//           fontSize: 12, whiteSpace: 'nowrap', pointerEvents: 'none', fontFamily: 'var(--font)',
//         }}>
//           <span style={{ color, fontWeight: 700 }}>{label}</span>
//           <span style={{ color: '#e2e8f0' }}> — <strong>{item.count}</strong> ({pct}%)</span>
//         </div>
//       )}
//     </div>
//   );
// }

// function TopList({ title, items = [], color, renderItem }) {
//   const max = items[0]?.count || 1;
//   return (
//     <div style={s.topList}>
//       <div style={s.topTitle}>{title}</div>
//       {items.slice(0, 8).map((item, i) => (
//         <HoverBar key={i} item={item} index={i} max={max} color={color} renderItem={renderItem} />
//       ))}
//       {items.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>no data yet…</div>}
//     </div>
//   );
// }

// export default function MetricsPanel({ stats, events }) {
//   const loginRate = stats
//     ? Math.round((stats.loginSuccesses / Math.max(stats.loginSuccesses + stats.loginFailures, 1)) * 100) : 0;
//   const eventsPerMin = stats
//     ? Math.round(stats.totalEvents / Math.max(stats.uptimeSeconds / 60, 1)) : 0;

//   return (
//     <div style={s.container}>
//       <div style={s.header}>
//         <span style={s.headerTitle}>Metrics</span>
//         <span style={s.headerSub}>Live Aggregation</span>
//       </div>

//       <div style={s.kpiGrid}>
//         <StatCard icon="⚡" label="Total Attacks"  value={stats?.totalAttacks?.toLocaleString() ?? 0} color="#ff4d4f" />
//         <StatCard icon="🌐" label="Unique IPs"     value={stats?.uniqueIPs?.toLocaleString() ?? 0}   color="#4f6ef7" />
//         <StatCard icon="💀" label="Sessions"       value={stats?.activeSessions?.length?.toLocaleString() ?? 0} color="#a78bfa" sub="active" />
//         <StatCard icon="🔓" label="Breached"       value={stats?.loginSuccesses ?? 0} color="#ff7c3a" sub={`${loginRate}% rate`} />
//         <StatCard icon="⚠️" label="Suspicious"    value={stats?.suspiciousCommands ?? 0} color="#fbbf24" />
//         <StatCard icon="📡" label="Events / min"  value={eventsPerMin} color="#36d068" />
//       </div>

//       {stats?.severityCounts && (
//         <div style={s.section}>
//           <div style={s.sectionTitle}>Severity Distribution</div>
//           {[['CRITICAL','#ff4d4f'],['HIGH','#ff7c3a'],['MEDIUM','#fbbf24'],['LOW','#36d068'],['INFO','#38bdf8']].map(([label, color]) => {
//             const count = stats.severityCounts[label] || 0;
//             const total = stats.totalEvents || 1;
//             return (
//               <div key={label} style={s.sevRow}>
//                 <span style={{ ...s.sevLabel, color }}>{label}</span>
//                 <div style={s.sevTrack}>
//                   <motion.div
//                     initial={{ width: 0 }}
//                     animate={{ width: `${(count / total) * 100}%` }}
//                     transition={{ duration: 0.6 }}
//                     style={{ height: '100%', background: color, borderRadius: 2 }}
//                   />
//                 </div>
//                 <span style={s.sevCount}>{count}</span>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       <div style={s.topGrid}>
//         <TopList title="Top Usernames" items={stats?.topUsernames || []} color="#4f6ef7" />
//         <TopList title="Top Passwords" items={stats?.topPasswords || []} color="#a78bfa" />
//         <TopList title="Top Commands"  items={stats?.topCommands || []} color="#ff7c3a" renderItem={item => item.name.substring(0, 26)} />
//         <TopList title="Top Countries" items={stats?.topCountries || []} color="#36d068" renderItem={item => `${flagEmoji(item.cc)} ${item.name}`} />
//       </div>
//     </div>
//   );
// }

// const s = {
//   container: {
//     background: 'var(--surface)', border: '1px solid var(--border)',
//     borderRadius: 'var(--radius)', overflow: 'hidden',
//     boxShadow: 'var(--shadow-sm)', fontFamily: 'var(--font)',
//   },
//   header: {
//     display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//     padding: '13px 18px', borderBottom: '1px solid var(--border-soft)',
//   },
//   headerTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' },
//   headerSub:   { fontSize: 11, color: 'var(--text-muted)' },
//   kpiGrid: {
//     display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
//     gap: 1, background: 'var(--border-soft)', borderBottom: '1px solid var(--border-soft)',
//   },
//   card: { background: 'var(--surface)', padding: '14px 16px', cursor: 'default', transition: 'all 0.14s' },
//   cardVal:   { fontSize: 26, fontWeight: 700, lineHeight: 1, marginBottom: 4 },
//   cardLabel: { color: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 },
//   cardSub:   { color: 'var(--text-muted)', fontSize: 10, marginTop: 2 },
//   iconBox: {
//     width: 36, height: 36, borderRadius: 'var(--radius-sm)',
//     display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
//   },
//   section: { padding: '14px 18px', borderBottom: '1px solid var(--border-soft)' },
//   sectionTitle: { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 },
//   sevRow:   { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 },
//   sevLabel: { fontSize: 11, fontWeight: 600, width: 58 },
//   sevTrack: { flex: 1, height: 5, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' },
//   sevCount: { color: 'var(--text-muted)', fontSize: 11, width: 28, textAlign: 'right' },
//   topGrid:  { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' },
//   topList:  { padding: '14px 16px', borderRight: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)' },
//   topTitle: { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 },
//   topRow:   { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 },
//   rank:     { color: 'var(--text-muted)', fontSize: 11, width: 22, fontWeight: 600 },
//   barWrap:  { flex: 1, height: 26, background: 'transparent', borderRadius: 4, position: 'relative', overflow: 'hidden' },
//   barFill:  { position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 4, transition: 'width 0.55s ease' },
//   barLabel: {
//     position: 'absolute', top: '50%', left: 9, transform: 'translateY(-50%)',
//     fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '90%', textOverflow: 'ellipsis',
//     letterSpacing: 0.1,
//   },
//   barCount: { fontSize: 12, width: 36, textAlign: 'right', fontWeight: 700 },
// };






import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { flagEmoji } from '../utils/helpers';

function StatCard({ label, value, color, sub, icon }) {
return (
<motion.div
style={{
...s.card,
border: `1px solid ${color}22`,
}}
whileHover={{
scale: 1.02,
boxShadow: `0 8px 25px ${color}33`,
borderColor: color,
}}
transition={{ duration: 0.25 }}
> <div style={s.cardRow}>


    {/* LEFT SIDE → ICON + LABEL */}
    <div style={s.leftSide}>
      <div style={{
        ...s.iconBox,
        background: `${color}20`,
        boxShadow: `0 0 12px ${color}22`
      }}>
        {icon}
      </div>

      <div>
        <div style={s.cardLabel}>{label}</div>
        {sub && <div style={s.cardSub}>{sub}</div>}
      </div>
    </div>

    {/* RIGHT SIDE → VALUE */}
    <div style={{ ...s.cardVal, color }}>
      {value ?? '—'}
    </div>

  </div>

  {/* Bottom glow line */}
  <div style={{
    height: 2,
    marginTop: 10,
    background: `linear-gradient(90deg, transparent, ${color}, transparent)`
  }} />
</motion.div>


);
}



function HoverBar({ item, index, max, color, renderItem }) {
const [hov, setHov] = useState(false);
const pct = Math.round(((item.count || 0) / (max || 1)) * 100);
const opacity = Math.max(0.35, 1 - index * 0.08);
const label = renderItem ? renderItem(item) : item.name;

return (
<div
style={{ ...s.topRow, position: 'relative' }}
onMouseEnter={() => setHov(true)}
onMouseLeave={() => setHov(false)}
> <span style={s.rank}>#{index + 1}</span>


  <div style={s.barWrap}>
    {/* Background Track */}
    <div style={{
      position: 'absolute',
      inset: 0,
      background: color + '15',
      borderRadius: 4
    }} />

    {/* Fill */}
    <div style={{
      ...s.barFill,
      width: `${pct}%`,
      background: color,
      opacity,
      transition: 'all 0.3s ease',
      boxShadow: hov ? `0 4px 15px ${color}66` : 'none'
    }} />

    {/* Label */}
    <span style={{
      ...s.barLabel,
      color: pct > 25 ? '#ffffff' : color,
      fontWeight: 600,
      zIndex: 2,
    }}>
      {label}
    </span>
  </div>

  <span style={{ ...s.barCount, color }}>{item.count}</span>

  {/* 🔥 HOVER TOOLTIP */}
  {hov && (
    <div style={{
      position: 'absolute',
      right: 40,
      top: '50%',
      transform: 'translateY(-50%)',
      background: '#0a0f1c',
      border: `1px solid ${color}55`,
      borderRadius: 10,
      padding: '8px 14px',
      boxShadow: `0 0 20px ${color}22`,
      fontSize: 13,
      zIndex: 50,
      whiteSpace: 'nowrap'
    }}>
      <div style={{ color, fontWeight: 700, marginBottom: 4 }}>
        {label}
      </div>

      <div style={{ color: '#e6edf3' }}>
        Count: <b>{item.count}</b>
      </div>

      <div style={{ color: '#94a3b8' }}>
        Usage: {pct}%
      </div>
    </div>
  )}
</div>


);
}


function TopList({ title, items = [], color, renderItem }) {
const max = items[0]?.count || 1;
return ( <div style={s.topList}>
{/* 🔥 UPDATED HEADING */}
<div style={{ ...s.topTitle, borderLeft: `4px solid ${color}` }}>
{title} </div>


  {items.slice(0, 8).map((item, i) => (
    <HoverBar key={i} item={item} index={i} max={max} color={color} renderItem={renderItem} />
  ))}
</div>


);
}

export default function MetricsPanel({ stats, events }) {
const loginRate = stats
? Math.round((stats.loginSuccesses / Math.max(stats.loginSuccesses + stats.loginFailures, 1)) * 100) : 0;
const eventsPerMin = stats
? Math.round(stats.totalEvents / Math.max(stats.uptimeSeconds / 60, 1)) : 0;

return ( <div style={s.container}> <div style={s.header}> <span style={s.headerTitle}>Metrics</span> <span style={s.headerSub}>Live Aggregation</span> </div>


  <div style={s.kpiGrid}>
    <StatCard icon="⚡" label="Total Attacks" value={stats?.totalAttacks?.toLocaleString() ?? 0} color="#ff4d4f" />
    <StatCard icon="🌐" label="Unique IPs" value={stats?.uniqueIPs?.toLocaleString() ?? 0} color="#4f6ef7" />
    <StatCard icon="💀" label="Sessions" value={stats?.activeSessions?.length?.toLocaleString() ?? 0} color="#a78bfa" sub="active" />
    <StatCard icon="🔓" label="Breached" value={stats?.loginSuccesses ?? 0} color="#ff7c3a" sub={`${loginRate}% rate`} />
    <StatCard icon="⚠️" label="Suspicious" value={stats?.suspiciousCommands ?? 0} color="#fbbf24" />
    <StatCard icon="📡" label="Events / min" value={eventsPerMin} color="#36d068" />
  </div>

  {stats?.severityCounts && (
    <div style={s.section}>
      {/* 🔥 UPDATED SECTION HEADING */}
      <div style={s.sectionTitle}>⚡ Severity Distribution</div>

      {[['CRITICAL','#ff4d4f'],['HIGH','#ff7c3a'],['MEDIUM','#fbbf24'],['LOW','#36d068'],['INFO','#38bdf8']].map(([label, color]) => {
        const count = stats.severityCounts[label] || 0;
        const total = stats.totalEvents || 1;
        return (
          <div key={label} style={s.sevRow}>
            <span style={{ ...s.sevLabel, color }}>{label}</span>
            <div style={s.sevTrack}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(count / total) * 100}%` }}
                transition={{ duration: 0.6 }}
                style={{ height: '100%', background: color, borderRadius: 2 }}
              />
            </div>
            <span style={s.sevCount}>{count}</span>
          </div>
        );
      })}
    </div>
  )}

  <div style={s.topGrid}>
    <TopList title="Top Usernames" items={stats?.topUsernames || []} color="#4f6ef7" />
    <TopList title="Top Passwords" items={stats?.topPasswords || []} color="#a78bfa" />
    <TopList title="Top Commands" items={stats?.topCommands || []} color="#ff7c3a" renderItem={item => item.name.substring(0, 26)} />
    <TopList title="Top Countries" items={stats?.topCountries || []} color="#36d068" renderItem={item => `${flagEmoji(item.cc)} ${item.name}`} />
  </div>
</div>


);
}

const s = {
container: {
background: 'var(--surface)',
border: '1px solid var(--border)',
borderRadius: 'var(--radius)',
overflow: 'hidden',
boxShadow: 'var(--shadow-sm)',
fontFamily: 'var(--font)',
},

header: {
display: 'flex',
alignItems: 'center',
justifyContent: 'space-between',
padding: '13px 18px',
borderBottom: '1px solid var(--border-soft)',
},

headerTitle: {
fontSize: 18,
fontWeight: 800,
color: '#ffffff'
},

headerSub: {
fontSize: 13,
color: '#94a3b8'
},

/* 🔥 BIGGER HEADING */
topTitle: {
fontSize: 16,
fontWeight: 800,
color: '#ffffff',
paddingLeft: 10,
marginBottom: 12,
letterSpacing: '0.04em'
},

sectionTitle: {
fontSize: 15,
fontWeight: 800,
color: '#00ffcc',
marginBottom: 12
},

kpiGrid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 12,                     // ✅ proper spacing
  padding: 12,                 // ✅ align inside container
},

card: {
  background: 'var(--surface)',
  padding: '16px 18px',
  borderRadius: 10,
  border: '1px solid var(--border-soft)', // ✅ consistent border
  transition: 'all 0.25s ease',
},

cardVal: { fontSize: 26, fontWeight: 700 },
cardLabel: { fontSize: 12 },
cardSub: { fontSize: 11 },

iconBox: {
width: 36,
height: 36,
display: 'flex',
alignItems: 'center',
justifyContent: 'center'
},

section: {
padding: '14px 18px',
borderBottom: '1px solid var(--border-soft)'
},

sevRow: { display: 'flex', gap: 10, marginBottom: 7 },
sevLabel: { width: 58 },
sevTrack: { flex: 1, height: 5, background: '#111' },
sevCount: { width: 28 },

topGrid: {
display: 'grid',
gridTemplateColumns: 'repeat(2, 1fr)'
},

cardRow: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
},

leftSide: {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
},

cardVal: {
  fontSize: 30,
  fontWeight: 800,
  letterSpacing: '1px'
},

cardLabel: {
  fontSize: 14,
  color: '#cbd5f5',
  fontWeight: 600
},

cardSub: {
  fontSize: 12,
  color: '#64748b'
},

iconBox: {
  width: 42,
  height: 42,
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18,
},

topList: {
padding: '14px 16px',
borderRight: '1px solid var(--border-soft)',
borderBottom: '1px solid var(--border-soft)'
},

topRow: { display: 'flex', gap: 7, marginBottom: 6 },
rank: { width: 22 },
barWrap: { flex: 1, height: 26, position: 'relative' },
barFill: { position: 'absolute', height: '100%' },
barLabel: { position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' },
barCount: { width: 36 }
};
