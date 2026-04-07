// components/Sidebar.jsx
import React from 'react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '◈', label: 'DASHBOARD' },
  { id: 'map',       icon: '◉', label: 'THREAT MAP' },
  { id: 'sessions',  icon: '⌥', label: 'SESSIONS' },
  { id: 'analytics', icon: '◎', label: 'ANALYTICS' },
];

export default function Sidebar({ active, onNav, collapsed, onToggle, stats }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 52 : 180 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={styles.sidebar}
    >
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>⬡</div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={styles.logoText}
          >
            <div style={styles.logoMain}>HEXWATCH</div>
            <div style={styles.logoSub}>HONEYPOT IDS</div>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            style={{
              ...styles.navItem,
              ...(active === item.id ? styles.navActive : {}),
            }}
            onClick={() => onNav(item.id)}
            title={collapsed ? item.label : ''}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={styles.navLabel}
              >
                {item.label}
              </motion.span>
            )}
            {active === item.id && (
              <motion.div
                layoutId="active-indicator"
                style={styles.activeIndicator}
              />
            )}
          </button>
        ))}
      </nav>

      {/* Mini stats */}
      {!collapsed && stats && (
        <div style={styles.miniStats}>
          <MiniStat label="ATTACKS" value={stats.totalAttacks} color="#ff2020" />
          <MiniStat label="UNIQUE IPs" value={stats.uniqueIPs} color="#38bdf8" />
          <MiniStat label="SESSIONS" value={stats.activeSessions?.length || 0} color="#a78bfa" />
        </div>
      )}

      {/* Collapse toggle */}
      <button style={styles.toggle} onClick={onToggle}>
        {collapsed ? '▶' : '◀'}
      </button>
    </motion.aside>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={styles.miniStat}>
      <div style={{ ...styles.miniValue, color }}>{value ?? 0}</div>
      <div style={styles.miniLabel}>{label}</div>
    </div>
  );
}

const styles = {
  sidebar: {
    background: '#0a0a0f',
    borderRight: '1px solid #1e293b',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', flexShrink: 0,
    fontFamily: '"JetBrains Mono", monospace',
    position: 'relative',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '14px 14px 12px',
    borderBottom: '1px solid #1e293b',
  },
  logoIcon: {
    fontSize: 22, color: '#ff2020',
    textShadow: '0 0 12px #ff202088',
    flexShrink: 0,
  },
  logoText: { overflow: 'hidden' },
  logoMain: { color: '#e2e8f0', fontSize: 13, fontWeight: 700, letterSpacing: 2 },
  logoSub: { color: '#334155', fontSize: 8, letterSpacing: 2 },
  nav: { flex: 1, padding: '8px 0' },
  navItem: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', border: 'none', background: 'transparent',
    color: '#475569', cursor: 'pointer', position: 'relative',
    fontSize: 10, transition: 'color 0.15s',
    textAlign: 'left',
  },
  navActive: { color: '#e2e8f0', background: '#0f172a' },
  navIcon: { fontSize: 14, flexShrink: 0 },
  navLabel: { fontSize: 10, letterSpacing: 1.5, fontWeight: 600 },
  activeIndicator: {
    position: 'absolute', right: 0, top: '15%', bottom: '15%',
    width: 3, background: '#ff2020',
    borderRadius: '2px 0 0 2px',
    boxShadow: '0 0 6px #ff2020',
  },
  miniStats: {
    padding: '12px 14px',
    borderTop: '1px solid #1e293b',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  miniStat: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  miniValue: { fontSize: 16, fontWeight: 700 },
  miniLabel: { color: '#334155', fontSize: 8, letterSpacing: 1.5 },
  toggle: {
    padding: '10px', border: 'none', background: '#0d1117',
    color: '#334155', cursor: 'pointer', fontSize: 10,
    borderTop: '1px solid #1e293b',
  },
};