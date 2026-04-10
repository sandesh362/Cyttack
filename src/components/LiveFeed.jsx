import React, { useEffect, useMemo, useState } from 'react';
import {
  formatRelative,
  formatTimestamp,
  getEventDetail,
  getEventIcon,
  getEventLabel,
  getEventShortLabel,
  getSeverityAppearance,
  severityOrder,
} from '../utils/ui';

const FILTER_OPTIONS = ['all', 'login_failed', 'login_success', 'command', 'session_connect'];

export default function LiveFeed({ events }) {
  const [filter, setFilter] = useState('all');
  const [paused, setPaused] = useState(false);
  const [search, setSearch] = useState('');
  const [displayEvents, setDisplayEvents] = useState([]);

  useEffect(() => {
    if (!paused) {
      setDisplayEvents(events);
    }
  }, [events, paused]);

  const filtered = useMemo(() => {
    return displayEvents.filter((event) => {
      if (filter !== 'all' && event.type !== filter) return false;
      if (!search) return true;
      const query = search.toLowerCase();
      return [event.ip, event.username, event.command, event.geo?.country, event.type]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [displayEvents, filter, search]);

  const summaryRows = useMemo(() => {
    const priorityCount = filtered.filter((event) => severityOrder(event.severityLabel) >= 4 || event.suspicious).length;
    return [
      { label: 'Visible events', value: filtered.length },
      { label: 'Priority alerts', value: priorityCount },
      { label: 'Last update', value: filtered[0] ? formatRelative(filtered[0].timestamp) : '--' },
    ];
  }, [filtered]);

  return (
    <section className="dashboard-panel soft">
      <div className="panel-header">
        <div>
          <span className="section-chip">
            <span className={`status-dot ${paused ? 'offline' : ''}`} />
            Activity feed
          </span>
          <h3 className="panel-title">Real-time alert queue</h3>
          <p className="panel-copy">
            Filter and search the existing event stream while keeping the feed optimized for analyst triage.
          </p>
        </div>
        <div className="session-toolbar">
          {summaryRows.map((row) => (
            <div key={row.label} className="status-pill tone-sand">
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="panel-body metrics-stack">
        <div className="feed-toolbar">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option}
              className={`filter-pill ${filter === option ? 'active' : ''}`}
              onClick={() => setFilter(option)}
            >
              {option === 'all' ? 'All events' : getEventShortLabel(option)}
            </button>
          ))}
          <input
            className="search-input"
            placeholder="Search by IP, user, command, country"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className={`surface-button ${paused ? 'active' : ''}`} onClick={() => setPaused((value) => !value)}>
            {paused ? 'Resume stream' : 'Pause stream'}
          </button>
        </div>

        <div className="feed-list">
          {filtered.slice(0, 10).map((event, index) => {
            const appearance = getSeverityAppearance(event.severityLabel);
            return (
              <article key={event.id || `${event.timestamp}-${index}`} className="feed-item">
                <div className="feed-item-header">
                  <div className="feed-label">
                    <span className="tiny-code">{getEventIcon(event.type)}</span>
                    <div>
                      <strong>{getEventLabel(event.type)}</strong>
                      <div className="feed-meta">{event.ip || 'Unknown source'} • {formatTimestamp(event.timestamp)}</div>
                    </div>
                  </div>
                  <span className="severity-pill" style={{ color: appearance.color, background: appearance.bg, borderColor: appearance.bg }}>
                    {event.severityLabel || 'INFO'}
                  </span>
                </div>
                <div className="feed-item-body">
                  <p className="feed-copy">{getEventDetail(event)}</p>
                  <span className="muted-text">{event.geo?.country || 'Unknown location'}</span>
                </div>
              </article>
            );
          })}
          {!filtered.length && (
            <div className="empty-state">
              <div>
                <strong>No events match the current filter.</strong>
                Adjust the filter or wait for new live traffic to arrive.
              </div>
            </div>
          )}
        </div>

        <div className="log-table">
          <div className="log-table-header">
            <span>Time</span>
            <span>Type</span>
            <span>Source</span>
            <span>Details</span>
            <span>Severity</span>
          </div>
          {filtered.slice(0, 12).map((event, index) => {
            const appearance = getSeverityAppearance(event.severityLabel);
            return (
              <div key={`row-${event.id || index}`} className="log-row">
                <span>{formatTimestamp(event.timestamp)}</span>
                <span>{getEventShortLabel(event.type)}</span>
                <span>{event.ip || '--'}</span>
                <span>{getEventDetail(event)}</span>
                <span style={{ color: appearance.color, fontWeight: 700 }}>{event.severityLabel || 'INFO'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
