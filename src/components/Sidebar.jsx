import React from 'react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'DB', label: 'Dashboard' },
  { id: 'map', icon: 'MP', label: 'Threat map' },
  { id: 'sessions', icon: 'SS', label: 'Sessions' },
  { id: 'analytics', icon: 'AN', label: 'Analytics' },
];

export default function Sidebar({ active, onNav, collapsed, onToggle, stats, connected }) {
  return (
    <motion.aside
      className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}
      animate={{ width: collapsed ? 84 : 220 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      <div className="sidebar-brand">
        <div className="sidebar-brand-badge">CT</div>
        {!collapsed && (
          <div className="sidebar-brand-copy">
            <p className="eyebrow">SOC platform</p>
            <h1 className="sidebar-brand-title">CYTTAK</h1>
            <p className="sidebar-brand-text">Live honeypot visibility for triage, hunting, and response.</p>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="sidebar-status-card">
          <span className="eyebrow">Sensor status</span>
          <div className="sidebar-status-value">
            <span className={`status-dot ${connected ? '' : 'offline'}`} />
            <strong>{connected ? 'Streaming' : 'Disconnected'}</strong>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNav(item.id)}
              title={collapsed ? item.label : ''}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!collapsed && <span className="sidebar-nav-label">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {!collapsed && stats && (
        <div className="sidebar-stats">
          <MiniStat label="Alerts" value={stats.totalEvents} tone="var(--ocean-deep)" />
          <MiniStat label="Critical" value={(stats.severityCounts?.CRITICAL || 0) + (stats.severityCounts?.HIGH || 0)} tone="var(--coral)" />
          <MiniStat label="Sources" value={stats.uniqueIPs} tone="var(--sand-deep)" />
          <MiniStat label="Sessions" value={stats.activeSessions?.length || 0} tone="var(--seafoam)" />
        </div>
      )}

      <button className="sidebar-toggle" onClick={onToggle}>
        {collapsed ? 'Expand' : 'Collapse'}
      </button>
    </motion.aside>
  );
}

function MiniStat({ label, value, tone }) {
  return (
    <div className="sidebar-stat-tile">
      <strong className="sidebar-stat-value" style={{ color: tone }}>{value ?? 0}</strong>
      <span className="sidebar-stat-label">{label}</span>
    </div>
  );
}
