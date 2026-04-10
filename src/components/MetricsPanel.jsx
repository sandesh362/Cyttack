import React from 'react';
import { flagEmoji, getSeverityAppearance } from '../utils/ui';

function StatCard({ label, value, detail, tone }) {
  const tones = {
    ocean: 'rgba(125, 178, 207, 0.18)',
    sea: 'rgba(132, 194, 187, 0.18)',
    coral: 'rgba(207, 127, 109, 0.18)',
    amber: 'rgba(216, 176, 106, 0.18)',
  };

  return (
    <article className="metric-card" style={{ '--metric-accent': tones[tone] || tones.ocean }}>
      <p className="metric-label">{label}</p>
      <h3 className="metric-value">{value ?? 0}</h3>
      <p className="metric-detail">{detail}</p>
    </article>
  );
}

function SummaryCard({ title, value, rows }) {
  return (
    <section className="summary-card">
      <h4>{title}</h4>
      <p>{value}</p>
      <ul>
        {rows.map((row) => (
          <li key={row.label} className="summary-row">
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SeverityRail({ counts = {}, total = 0 }) {
  return (
    <section className="summary-card">
      <h4>Severity mix</h4>
      <p>{total.toLocaleString()} events</p>
      <div className="severity-rail">
        {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map((label) => {
          const count = counts[label] || 0;
          const appearance = getSeverityAppearance(label);
          const width = total ? `${(count / total) * 100}%` : '0%';
          return (
            <div key={label} className="severity-row">
              <span className="severity-label" style={{ color: appearance.color }}>
                {label}
              </span>
              <div className="severity-track">
                <div className="severity-fill" style={{ width, background: appearance.color }} />
              </div>
              <strong>{count}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TopList({ title, items = [], accent = 'rgba(125, 178, 207, 0.24)', renderItem }) {
  return (
    <section className="top-list">
      <h4>{title}</h4>
      <div className="top-list-items">
        {items.slice(0, 6).map((item, index) => {
          const width = `${Math.round((item.count / (items[0]?.count || 1)) * 100)}%`;
          return (
            <div key={`${title}-${item.name}-${index}`} className="top-list-row">
              <span className="top-list-rank">{index + 1}</span>
              <div className="top-list-bar">
                <div className="top-list-bar-fill" style={{ width, background: accent }} />
                <span className="top-list-label">{renderItem ? renderItem(item) : item.name}</span>
              </div>
              <span className="top-list-count">{item.count}</span>
            </div>
          );
        })}
        {!items.length && <div className="muted-text">Waiting for enough live data to rank this list.</div>}
      </div>
    </section>
  );
}

export default function MetricsPanel({ stats, cards = [] }) {
  const totalEvents = stats?.totalEvents || 0;
  const loginAttempts = (stats?.loginSuccesses || 0) + (stats?.loginFailures || 0);
  const authRate = loginAttempts ? Math.round(((stats?.loginSuccesses || 0) / loginAttempts) * 100) : 0;
  const eventsPerMinute = stats ? Math.round(stats.totalEvents / Math.max(stats.uptimeSeconds / 60, 1)) : 0;

  return (
    <section className="dashboard-panel">
      <div className="panel-header">
        <div>
          <span className="section-chip">Operations summary</span>
          <h3 className="panel-title">Analyst metrics and threat posture</h3>
          <p className="panel-copy">
            Core KPIs, severity distribution, and top attacker behavior sourced directly from the existing live stream.
          </p>
        </div>
      </div>
      <div className="panel-body metrics-stack">
        <div className="metric-grid">
          {cards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <div className="metrics-layout">
          <div className="metrics-stack">
            <div className="metrics-summary-grid">
              <SummaryCard
                title="Authentication posture"
                value={`${authRate}%`}
                rows={[
                  { label: 'Successful logins', value: stats?.loginSuccesses || 0 },
                  { label: 'Failed logins', value: stats?.loginFailures || 0 },
                  { label: 'Events per minute', value: eventsPerMinute },
                ]}
              />
              <SummaryCard
                title="Source footprint"
                value={stats?.uniqueIPs?.toLocaleString() || '0'}
                rows={[
                  { label: 'Observed countries', value: stats?.topCountries?.length || 0 },
                  { label: 'Active sessions', value: stats?.activeSessions?.length || 0 },
                  { label: 'Suspicious commands', value: stats?.suspiciousCommands || 0 },
                ]}
              />
            </div>
            <TopList title="Top usernames" items={stats?.topUsernames || []} accent="rgba(125, 178, 207, 0.24)" />
            <TopList title="Top countries" items={stats?.topCountries || []} accent="rgba(132, 194, 187, 0.24)" renderItem={(item) => `${flagEmoji(item.cc)} ${item.name}`} />
          </div>

          <div className="metrics-stack">
            <SeverityRail counts={stats?.severityCounts || {}} total={totalEvents} />
            <TopList title="Top passwords" items={stats?.topPasswords || []} accent="rgba(215, 194, 166, 0.34)" />
            <TopList title="Top commands" items={stats?.topCommands || []} accent="rgba(207, 127, 109, 0.24)" renderItem={(item) => item.name} />
          </div>
        </div>
      </div>
    </section>
  );
}
