// components/AlertBanner.jsx
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const MAX_ALERTS = 5;

export default function AlertBanner({ events }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const latest = events[0];
    if (!latest) return;

    if (latest.suspicious || latest.severityLabel === 'CRITICAL' || latest.type === 'login_success') {
      const alert = {
        id: latest.id || Date.now(),
        message: buildMessage(latest),
        level: latest.severityLabel || 'HIGH',
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      };

      setAlerts(prev => {
        // Deduplicate by id
        if (prev.some(a => a.id === alert.id)) return prev;
        return [alert, ...prev].slice(0, MAX_ALERTS);
      });

      // Auto-dismiss after 8s
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== alert.id));
      }, 8000);
    }
  }, [events]);

  if (alerts.length === 0) return null;

  return (
    <div style={styles.container}>
      <AnimatePresence>
        {alerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 40, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 40, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              ...styles.alert,
              borderColor: getLevelColor(alert.level),
              background: getLevelColor(alert.level) + '0f',
            }}
          >
            <span style={{ ...styles.levelBadge, color: getLevelColor(alert.level) }}>
              {alert.level === 'CRITICAL' ? '🚨' : alert.level === 'HIGH' ? '⚠' : '🔓'} {alert.level}
            </span>
            <span style={styles.msg}>{alert.message}</span>
            <span style={styles.time}>{alert.time}</span>
            <button
              style={styles.dismiss}
              onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
            >✕</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function buildMessage(event) {
  if (event.type === 'login_success') {
    return `SSH BREACH: ${event.ip} authenticated as ${event.username}`;
  }
  if (event.suspicious) {
    return `SUSPICIOUS CMD from ${event.ip}: ${(event.command || '').substring(0, 60)}`;
  }
  if (event.severityLabel === 'CRITICAL') {
    return `CRITICAL event from ${event.ip} — ${event.type}`;
  }
  return `Alert from ${event.ip}`;
}

function getLevelColor(level) {
  switch (level) {
    case 'CRITICAL': return '#ff2020';
    case 'HIGH': return '#ff6b35';
    default: return '#ffc107';
  }
}

const styles = {
  container: {
    position: 'fixed', top: 60, right: 16,
    display: 'flex', flexDirection: 'column', gap: 6,
    zIndex: 999, maxWidth: 380,
    fontFamily: '"JetBrains Mono", monospace',
  },
  alert: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 10px', border: '1px solid',
    borderRadius: 6, backdropFilter: 'blur(8px)',
    fontSize: 10, overflow: 'hidden',
  },
  levelBadge: { fontWeight: 700, whiteSpace: 'nowrap', fontSize: 9, letterSpacing: 0.5 },
  msg: { flex: 1, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  time: { color: '#475569', fontSize: 9, whiteSpace: 'nowrap' },
  dismiss: {
    background: 'transparent', border: 'none',
    color: '#475569', cursor: 'pointer', fontSize: 10, padding: '0 2px',
  },
};