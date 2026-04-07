// components/LiveFeed.jsx
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimestamp, getSeverityColor, getEventIcon, getEventLabel, truncate, flagEmoji } from '../utils/helpers';

const FILTER_OPTIONS = ['all', 'login_failed', 'login_success', 'command', 'session_connect'];

export default function LiveFeed({ events }) {
  const [filter, setFilter] = useState('all');
  const [paused, setPaused] = useState(false);
  const [search, setSearch] = useState('');
  const feedRef = useRef(null);
  const [displayEvents, setDisplayEvents] = useState([]);

  useEffect(() => {
    if (!paused) {
      setDisplayEvents(events);
    }
  }, [events, paused]);

  const filtered = displayEvents.filter(e => {
    if (filter !== 'all' && e.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (e.ip || '').includes(q) ||
        (e.username || '').toLowerCase().includes(q) ||
        (e.command || '').toLowerCase().includes(q) ||
        (e.geo?.country || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.dot} />
          <span style={styles.title}>LIVE ATTACK FEED</span>
          <span style={styles.count}>{filtered.length}</span>
        </div>
        <div style={styles.controls}>
          <button
            style={{ ...styles.pauseBtn, ...(paused ? styles.pausedActive : {}) }}
            onClick={() => setPaused(p => !p)}
          >
            {paused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>
        </div>
      </div>

      {/* Filters + Search */}
      <div style={styles.filterRow}>
        <div style={styles.filters}>
          {FILTER_OPTIONS.map(f => (
            <button
              key={f}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'ALL' : getEventLabel(f)}
            </button>
          ))}
        </div>
        <input
          style={styles.search}
          placeholder="search ip / user / command..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Terminal Feed */}
      <div ref={feedRef} style={styles.feed}>
        <AnimatePresence initial={false}>
          {filtered.slice(0, 150).map((event, i) => (
            <FeedRow key={event.id || i} event={event} isNew={i === 0 && !paused} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div style={styles.empty}>
            <span style={{ color: '#1aff1a', opacity: 0.3 }}>_ awaiting events...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedRow({ event, isNew }) {
  const color = getSeverityColor(event.severityLabel);
  const icon = getEventIcon(event.type);
  const label = getEventLabel(event.type);
  const flag = flagEmoji(event.geo?.countryCode);

  const detail = (() => {
    switch (event.type) {
      case 'login_failed':
      case 'login_success':
        return `${event.username || '?'}:${event.password || '?'}`;
      case 'command':
        return truncate(event.command, 55);
      case 'session_connect':
        return `→ SSH:${event.dstPort || 22}`;
      case 'session_close':
        return `duration ${event.duration || 0}s`;
      default:
        return '';
    }
  })();

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, x: -10, backgroundColor: 'rgba(26,255,26,0.08)' } : { opacity: 1 }}
      animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      style={styles.row}
    >
      <span style={styles.ts}>{formatTimestamp(event.timestamp)}</span>
      <span style={{ ...styles.badge, backgroundColor: color + '22', color, borderColor: color + '44' }}>
        {label}
      </span>
      <span style={styles.ip}>{event.ip}</span>
      <span style={styles.flag}>{flag}</span>
      <span style={{ ...styles.detail, color: event.suspicious ? '#ff6b35' : '#94a3b8' }}>
        {event.suspicious && <span style={{ color: '#ff6b35', marginRight: 4 }}>⚠</span>}
        {icon} {detail}
      </span>
      <span style={{ ...styles.severity, color }}>
        {event.severity}
      </span>
    </motion.div>
  );
}

const styles = {
  container: {
    background: '#0a0a0f',
    border: '1px solid #1e293b',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px', borderBottom: '1px solid #1e293b',
    background: '#0d1117',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  dot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#1aff1a',
    boxShadow: '0 0 6px #1aff1a',
    animation: 'pulse 2s infinite',
  },
  title: { color: '#1aff1a', fontSize: 11, fontWeight: 700, letterSpacing: 2 },
  count: {
    background: '#1e293b', color: '#64748b',
    fontSize: 10, padding: '2px 6px', borderRadius: 3,
  },
  controls: { display: 'flex', gap: 8 },
  pauseBtn: {
    background: 'transparent', border: '1px solid #334155',
    color: '#64748b', fontSize: 10, padding: '4px 8px', borderRadius: 4,
    cursor: 'pointer', letterSpacing: 1,
  },
  pausedActive: { borderColor: '#ffc107', color: '#ffc107' },
  filterRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 14px', borderBottom: '1px solid #1e293b',
    background: '#0d1117',
  },
  filters: { display: 'flex', gap: 4 },
  filterBtn: {
    background: 'transparent', border: '1px solid #1e293b',
    color: '#475569', fontSize: 9, padding: '3px 7px', borderRadius: 3,
    cursor: 'pointer', letterSpacing: 1,
  },
  filterActive: { borderColor: '#1aff1a44', color: '#1aff1a', background: '#1aff1a0a' },
  search: {
    flex: 1, background: '#0a0a0f', border: '1px solid #1e293b',
    color: '#94a3b8', fontSize: 10, padding: '4px 8px', borderRadius: 4,
    outline: 'none', fontFamily: 'inherit',
  },
  feed: {
    flex: 1, overflowY: 'auto',
    scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent',
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '5px 14px', borderBottom: '1px solid #0f172a',
    fontSize: 11, minHeight: 28,
    cursor: 'default',
  },
  ts: { color: '#334155', minWidth: 70 },
  badge: {
    fontSize: 9, padding: '1px 5px', borderRadius: 3,
    border: '1px solid', minWidth: 62, textAlign: 'center',
    fontWeight: 700, letterSpacing: 0.5,
  },
  ip: { color: '#38bdf8', minWidth: 120, fontWeight: 600 },
  flag: { fontSize: 12 },
  detail: { flex: 1, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  severity: { minWidth: 28, textAlign: 'right', fontWeight: 700, fontSize: 10 },
  empty: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 },
};