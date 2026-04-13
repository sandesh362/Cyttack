// components/LiveFeed.jsx
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimestamp, getSeverityColor, getEventIcon, getEventLabel, truncate, flagEmoji } from '../utils/helpers';

const FILTER_OPTIONS = ['all', 'login_failed', 'login_success', 'command', 'session_connect'];

const SEV_STYLE = {
  CRITICAL: { bg: '#fff0f0', color: '#e8393a' },
  HIGH:     { bg: '#fff4ed', color: '#f76707' },
  MEDIUM:   { bg: '#fffbeb', color: '#e08900' },
  LOW:      { bg: '#ebfbee', color: '#2f9e44' },
  INFO:     { bg: '#e0f2fe', color: '#0284c7' },
};

export default function LiveFeed({ events }) {
  const [filter, setFilter] = useState('all');
  const [paused, setPaused] = useState(false);
  const [search, setSearch] = useState('');
  const feedRef = useRef(null);
  const [displayEvents, setDisplayEvents] = useState([]);

  useEffect(() => {
    if (!paused) setDisplayEvents(events);
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
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={s.liveDot} />
          <span style={s.title}>Live Attack Feed</span>
          <span style={s.countBadge}>{filtered.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            style={{ ...s.btn, ...(paused ? s.btnWarning : {}) }}
            onClick={() => setPaused(p => !p)}
          >
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
        </div>
      </div>

      {/* Filters + Search */}
      <div style={s.filterRow}>
        <div style={{ display: 'flex', gap: 4 }}>
          {FILTER_OPTIONS.map(f => (
            <button
              key={f}
              style={{ ...s.filterBtn, ...(filter === f ? s.filterActive : {}) }}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : getEventLabel(f)}
            </button>
          ))}
        </div>
        <input
          style={s.search}
          placeholder="Search IP, user, command…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Feed */}
      <div ref={feedRef} style={s.feed}>
        <AnimatePresence initial={false}>
          {filtered.slice(0, 150).map((event, i) => (
            <FeedRow key={event.id || i} event={event} isNew={i === 0 && !paused} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div style={s.empty}>
            <span style={{ color: 'var(--text-muted)' }}>Awaiting events…</span>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedRow({ event, isNew }) {
  const sevStyle = SEV_STYLE[event.severityLabel] || SEV_STYLE.INFO;
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
      initial={isNew ? { opacity: 0, x: -8, backgroundColor: 'rgba(67,97,238,0.05)' } : { opacity: 1 }}
      animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      style={s.row}
    >
      <span style={s.ts}>{formatTimestamp(event.timestamp)}</span>
      <span style={{ ...s.badge, background: sevStyle.bg, color: sevStyle.color }}>
        {label}
      </span>
      <span style={s.ip}>{event.ip}</span>
      <span style={s.flag}>{flag}</span>
      <span style={{ ...s.detail, color: event.suspicious ? '#f76707' : 'var(--text-secondary)' }}>
        {event.suspicious && <span style={{ color: '#f76707', marginRight: 4 }}>⚠</span>}
        {icon} {detail}
      </span>
      <span style={{ ...s.sev, color: sevStyle.color, background: sevStyle.bg }}>
        {event.severity}
      </span>
    </motion.div>
  );
}

const s = {
  container: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column',
    height: '100%', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
    fontFamily: 'var(--font)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', borderBottom: '1px solid var(--border-soft)',
  },
  liveDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#2f9e44', flexShrink: 0,
    animation: 'pulse-dot 2s infinite',
  },
  title: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
  countBadge: {
    background: 'var(--bg)', color: 'var(--text-muted)',
    fontSize: 11, padding: '1px 7px', borderRadius: 10,
    border: '1px solid var(--border)',
  },
  btn: {
    background: 'var(--bg)', border: '1px solid var(--border)',
    color: 'var(--text-secondary)', fontSize: 12, padding: '4px 12px',
    borderRadius: 'var(--radius-xs)', cursor: 'pointer',
    fontFamily: 'var(--font)', fontWeight: 500,
  },
  btnWarning: { borderColor: '#e0890044', color: '#e08900', background: '#fffbeb' },
  filterRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 16px', borderBottom: '1px solid var(--border-soft)',
    background: 'var(--surface2)',
  },
  filterBtn: {
    background: 'transparent', border: '1px solid var(--border)',
    color: 'var(--text-muted)', fontSize: 11, padding: '3px 9px',
    borderRadius: 20, cursor: 'pointer', fontFamily: 'var(--font)',
    fontWeight: 500, whiteSpace: 'nowrap',
  },
  filterActive: {
    borderColor: '#4361ee44', color: '#4361ee',
    background: 'var(--accent-light)',
  },
  search: {
    flex: 1, background: 'var(--bg)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: 12, padding: '5px 11px',
    borderRadius: 'var(--radius-xs)', outline: 'none', fontFamily: 'var(--font)',
  },
  feed: {
    flex: 1, overflowY: 'auto',
    scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent',
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '7px 16px', borderBottom: '1px solid var(--border-soft)',
    fontSize: 12, minHeight: 36, cursor: 'default',
  },
  ts: { color: 'var(--text-muted)', minWidth: 76, fontSize: 11, fontFamily: 'var(--font-mono)' },
  badge: {
    fontSize: 10, padding: '2px 7px', borderRadius: 20,
    fontWeight: 700, minWidth: 68, textAlign: 'center', whiteSpace: 'nowrap',
  },
  ip: { color: '#4361ee', minWidth: 120, fontWeight: 600, fontSize: 12, fontFamily: 'var(--font-mono)' },
  flag: { fontSize: 14 },
  detail: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 },
  sev: { minWidth: 28, textAlign: 'right', fontWeight: 700, fontSize: 11, padding: '1px 6px', borderRadius: 20 },
  empty: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, fontSize: 13 },
};