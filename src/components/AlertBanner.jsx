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
        if (prev.some(a => a.id === alert.id)) return prev;
        return [alert, ...prev].slice(0, MAX_ALERTS);
      });

      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== alert.id));
      }, 8000);
    }
  }, [events]);

  if (alerts.length === 0) return null;

  return (
    <div style={s.container}>
      <AnimatePresence>
        {alerts.map(alert => {
          const color = getLevelColor(alert.level);
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.22 }}
              style={{ ...s.alert, borderLeft: `3px solid ${color}`, borderColor: 'var(--border)' }}
            >
              <span style={{ ...s.chip, background: color + '18', color }}>
                {alert.level === 'CRITICAL' ? '🚨' : alert.level === 'HIGH' ? '⚠️' : '🔓'} {alert.level}
              </span>
              <span style={s.msg}>{alert.message}</span>
              <span style={s.time}>{alert.time}</span>
              <button
                style={s.dismiss}
                onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
              >✕</button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function buildMessage(event) {
  if (event.type === 'login_success') return `SSH BREACH: ${event.ip} authenticated as ${event.username}`;
  if (event.suspicious) return `SUSPICIOUS CMD from ${event.ip}: ${(event.command || '').substring(0, 60)}`;
  if (event.severityLabel === 'CRITICAL') return `CRITICAL event from ${event.ip} — ${event.type}`;
  return `Alert from ${event.ip}`;
}

function getLevelColor(level) {
  switch (level) {
    case 'CRITICAL': return '#e8393a';
    case 'HIGH':     return '#f76707';
    default:         return '#e08900';
  }
}

const s = {
  container: {
    position: 'fixed', top: 64, right: 18,
    display: 'flex', flexDirection: 'column', gap: 7,
    zIndex: 999, maxWidth: 400,
    fontFamily: 'var(--font)',
  },
  alert: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 13px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: 'var(--shadow-md)',
    fontSize: 12,
  },
  chip: {
    padding: '2px 8px', borderRadius: 20,
    fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: 0.3,
  },
  msg: {
    flex: 1, color: 'var(--text-primary)', overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12,
  },
  time: { color: 'var(--text-muted)', fontSize: 11, whiteSpace: 'nowrap' },
  dismiss: {
    background: 'transparent', border: 'none',
    color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, padding: '0 2px',
    lineHeight: 1,
  },
};