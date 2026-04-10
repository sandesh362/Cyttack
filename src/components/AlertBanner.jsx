import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatTimestamp, getEventDetail, getEventLabel, getSeverityAppearance } from '../utils/ui';

const MAX_ALERTS = 4;

export default function AlertBanner({ events }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const latest = events[0];
    if (!latest) return undefined;

    if (latest.suspicious || latest.severityLabel === 'CRITICAL' || latest.severityLabel === 'HIGH') {
      const alert = {
        id: latest.id || `${latest.timestamp}-${latest.type}`,
        ip: latest.ip || 'Unknown source',
        label: getEventLabel(latest.type),
        detail: getEventDetail(latest),
        severity: latest.severityLabel || 'HIGH',
        time: formatTimestamp(latest.timestamp),
      };

      setAlerts((current) => {
        if (current.some((item) => item.id === alert.id)) return current;
        return [alert, ...current].slice(0, MAX_ALERTS);
      });

      const timer = setTimeout(() => {
        setAlerts((current) => current.filter((item) => item.id !== alert.id));
      }, 9000);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [events]);

  const visibleAlerts = useMemo(() => alerts.slice(0, MAX_ALERTS), [alerts]);

  if (!visibleAlerts.length) return null;

  return (
    <div style={styles.stack}>
      <AnimatePresence initial={false}>
        {visibleAlerts.map((alert) => {
          const appearance = getSeverityAppearance(alert.severity);
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              style={{
                ...styles.alert,
                borderColor: appearance.bg,
              }}
            >
              <div style={{ ...styles.accent, background: appearance.color }} />
              <div style={styles.content}>
                <div style={styles.topRow}>
                  <span style={{ ...styles.badge, color: appearance.color, background: appearance.bg }}>
                    {alert.severity}
                  </span>
                  <span style={styles.time}>{alert.time}</span>
                </div>
                <strong style={styles.title}>{alert.ip}</strong>
                <p style={styles.copy}>{alert.label}</p>
                <p style={styles.detail}>{alert.detail}</p>
              </div>
              <button
                style={styles.close}
                onClick={() => setAlerts((current) => current.filter((item) => item.id !== alert.id))}
                aria-label="Dismiss alert"
              >
                Close
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  stack: {
    position: 'fixed',
    top: 18,
    right: 24,
    zIndex: 999,
    display: 'grid',
    gap: 10,
    width: 'min(420px, calc(100vw - 32px))',
  },
  alert: {
    display: 'flex',
    gap: 14,
    padding: '16px 18px',
    borderRadius: 24,
    border: '1px solid rgba(145, 169, 190, 0.2)',
    background: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 18px 40px rgba(117, 146, 168, 0.16)',
    backdropFilter: 'blur(14px)',
  },
  accent: {
    width: 6,
    borderRadius: 999,
    flexShrink: 0,
  },
  content: {
    minWidth: 0,
    flex: 1,
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  badge: {
    display: 'inline-flex',
    padding: '7px 10px',
    borderRadius: 999,
    fontSize: '0.7rem',
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  time: {
    color: 'var(--text-soft)',
    fontSize: '0.8rem',
  },
  title: {
    display: 'block',
    fontSize: '0.95rem',
    marginBottom: 4,
  },
  copy: {
    margin: '0 0 4px',
    color: 'var(--text-soft)',
    fontSize: '0.92rem',
  },
  detail: {
    margin: 0,
    color: 'var(--text)',
    fontSize: '0.9rem',
    lineHeight: 1.45,
  },
  close: {
    alignSelf: 'flex-start',
    border: '0',
    background: 'transparent',
    color: 'var(--text-soft)',
    cursor: 'pointer',
    fontWeight: 700,
  },
};
