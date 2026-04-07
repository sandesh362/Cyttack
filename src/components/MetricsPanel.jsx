// components/MetricsPanel.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { flagEmoji } from '../utils/helpers';

function StatCard({ label, value, color = '#38bdf8', sub, icon }) {
  return (
    <motion.div
      style={{ ...styles.card, borderColor: color + '22' }}
      whileHover={{ borderColor: color + '55', background: '#0f172a' }}
      transition={{ duration: 0.15 }}
    >
      <div style={styles.cardIcon}>{icon}</div>
      <div style={{ ...styles.cardValue, color }}>{value ?? '—'}</div>
      <div style={styles.cardLabel}>{label}</div>
      {sub && <div style={styles.cardSub}>{sub}</div>}
    </motion.div>
  );
}

function TopList({ title, items = [], color = '#38bdf8', renderItem }) {
  return (
    <div style={styles.topList}>
      <div style={styles.topListTitle}>{title}</div>
      <div style={styles.topListRows}>
        {items.slice(0, 8).map((item, i) => (
          <div key={i} style={styles.topRow}>
            <span style={styles.rank}>#{i + 1}</span>
            <div style={styles.barWrapper}>
              <div
                style={{
                  ...styles.bar,
                  width: `${Math.round((item.count / (items[0]?.count || 1)) * 100)}%`,
                  background: color,
                  opacity: 0.15 + (0.85 * (items.length - i) / items.length),
                }}
              />
              <span style={styles.barLabel}>
                {renderItem ? renderItem(item) : item.name}
              </span>
            </div>
            <span style={{ ...styles.barCount, color }}>{item.count}</span>
          </div>
        ))}
        {items.length === 0 && <div style={styles.empty}>no data yet...</div>}
      </div>
    </div>
  );
}

export default function MetricsPanel({ stats, events }) {
  const loginRate = stats
    ? Math.round((stats.loginSuccesses / Math.max(stats.loginSuccesses + stats.loginFailures, 1)) * 100)
    : 0;

  const eventsPerMin = stats
    ? Math.round(stats.totalEvents / Math.max(stats.uptimeSeconds / 60, 1))
    : 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>METRICS</span>
        <span style={styles.sub}>LIVE AGGREGATION</span>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <StatCard icon="⚡" label="TOTAL ATTACKS" value={stats?.totalAttacks?.toLocaleString() ?? 0} color="#ff2020" />
        <StatCard icon="🌐" label="UNIQUE IPs" value={stats?.uniqueIPs?.toLocaleString() ?? 0} color="#38bdf8" />
        <StatCard icon="💀" label="SESSIONS" value={stats?.activeSessions?.length?.toLocaleString() ?? 0} color="#a78bfa" sub="active" />
        <StatCard icon="🔓" label="BREACHED" value={stats?.loginSuccesses ?? 0} color="#ff6b35" sub={`${loginRate}% rate`} />
        <StatCard icon="⚠" label="SUSPICIOUS" value={stats?.suspiciousCommands ?? 0} color="#ffc107" />
        <StatCard icon="📡" label="EVENTS/MIN" value={eventsPerMin} color="#1aff1a" />
      </div>

      {/* Severity breakdown */}
      {stats?.severityCounts && (
        <div style={styles.severity}>
          <div style={styles.sectionTitle}>SEVERITY DISTRIBUTION</div>
          <div style={styles.sevBars}>
            {[
              ['CRITICAL', '#ff2020'],
              ['HIGH', '#ff6b35'],
              ['MEDIUM', '#ffc107'],
              ['LOW', '#4caf50'],
              ['INFO', '#64748b'],
            ].map(([label, color]) => {
              const count = stats.severityCounts[label] || 0;
              const total = stats.totalEvents || 1;
              return (
                <div key={label} style={styles.sevRow}>
                  <span style={{ ...styles.sevLabel, color }}>{label}</span>
                  <div style={styles.sevBarTrack}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / total) * 100}%` }}
                      transition={{ duration: 0.6 }}
                      style={{ height: '100%', background: color, borderRadius: 2 }}
                    />
                  </div>
                  <span style={styles.sevCount}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Lists */}
      <div style={styles.topGrid}>
        <TopList
          title="TOP USERNAMES"
          items={stats?.topUsernames || []}
          color="#38bdf8"
        />
        <TopList
          title="TOP PASSWORDS"
          items={stats?.topPasswords || []}
          color="#a78bfa"
        />
        <TopList
          title="TOP COMMANDS"
          items={stats?.topCommands || []}
          color="#ff6b35"
          renderItem={item => item.name.substring(0, 28)}
        />
        <TopList
          title="TOP COUNTRIES"
          items={stats?.topCountries || []}
          color="#1aff1a"
          renderItem={item => `${flagEmoji(item.cc)} ${item.name}`}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: '#0a0a0f',
    border: '1px solid #1e293b',
    borderRadius: 8,
    overflow: 'hidden',
    fontFamily: '"JetBrains Mono", monospace',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px', background: '#0d1117',
    borderBottom: '1px solid #1e293b',
  },
  title: { color: '#e2e8f0', fontSize: 11, fontWeight: 700, letterSpacing: 2 },
  sub: { color: '#334155', fontSize: 9, letterSpacing: 1 },
  kpiGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 1, background: '#1e293b',
    borderBottom: '1px solid #1e293b',
  },
  card: {
    background: '#0a0a0f',
    padding: '12px 14px',
    border: '1px solid transparent',
    cursor: 'default',
    transition: 'all 0.15s',
  },
  cardIcon: { fontSize: 16, marginBottom: 4 },
  cardValue: { fontSize: 22, fontWeight: 700, lineHeight: 1 },
  cardLabel: { color: '#475569', fontSize: 9, letterSpacing: 1.5, marginTop: 3 },
  cardSub: { color: '#334155', fontSize: 9, marginTop: 2 },
  severity: { padding: '12px 14px', borderBottom: '1px solid #1e293b' },
  sectionTitle: { color: '#334155', fontSize: 9, letterSpacing: 2, marginBottom: 8 },
  sevBars: { display: 'flex', flexDirection: 'column', gap: 5 },
  sevRow: { display: 'flex', alignItems: 'center', gap: 8 },
  sevLabel: { fontSize: 9, width: 54, letterSpacing: 0.5 },
  sevBarTrack: {
    flex: 1, height: 4, background: '#1e293b', borderRadius: 2, overflow: 'hidden',
  },
  sevCount: { color: '#475569', fontSize: 9, width: 30, textAlign: 'right' },
  topGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 0,
  },
  topList: {
    padding: '12px 14px',
    borderRight: '1px solid #0f172a',
    borderBottom: '1px solid #0f172a',
  },
  topListTitle: { color: '#334155', fontSize: 9, letterSpacing: 2, marginBottom: 8 },
  topListRows: { display: 'flex', flexDirection: 'column', gap: 4 },
  topRow: { display: 'flex', alignItems: 'center', gap: 6 },
  rank: { color: '#1e293b', fontSize: 9, width: 16 },
  barWrapper: {
    flex: 1, height: 16, background: '#0d1117', borderRadius: 2,
    position: 'relative', overflow: 'hidden',
  },
  bar: { position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 2 },
  barLabel: {
    position: 'absolute', top: '50%', left: 4,
    transform: 'translateY(-50%)',
    fontSize: 9, color: '#94a3b8', whiteSpace: 'nowrap',
    overflow: 'hidden', maxWidth: '90%', textOverflow: 'ellipsis',
  },
  barCount: { fontSize: 9, width: 28, textAlign: 'right' },
  empty: { color: '#1e293b', fontSize: 10, padding: '4px 0' },
};