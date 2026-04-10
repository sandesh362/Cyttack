import { useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import AlertBanner from './components/AlertBanner';
import MetricsPanel from './components/MetricsPanel';
import AttackMap from './components/AttackMap';
import LiveFeed from './components/LiveFeed';
import SessionViewer from './components/SessionViewer';
import {
  AlertDistributionChart,
  CommandFrequencyChart,
  SeverityChart,
  ThreatTrendChart,
} from './components/Charts';
import { useWebSocket } from './useWebSocket';
import { getEventLabel, severityOrder } from './utils/ui';
import './components/dashboard-ui.css';
import './App.css';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { events, stats, connected } = useWebSocket();

  const activeSessions = useMemo(() => stats?.activeSessions || [], [stats?.activeSessions]);

  const dashboardData = useMemo(() => {
    const severityCounts = stats?.severityCounts || {};
    const totalEvents = stats?.totalEvents || events.length || 0;
    const totalAttacks = stats?.totalAttacks || 0;
    const suspiciousEvents = stats?.suspiciousCommands || events.filter((event) => event.suspicious).length;
    const criticalAlerts = (severityCounts.CRITICAL || 0) + (severityCounts.HIGH || 0);
    const loginAttempts = (stats?.loginSuccesses || 0) + (stats?.loginFailures || 0);
    const loginRate = loginAttempts
      ? Math.round(((stats?.loginSuccesses || 0) / loginAttempts) * 100)
      : 0;
    const latestEvent = events[0] || null;
    const eventTypeMap = new Map();

    events.forEach((event) => {
      const label = getEventLabel(event.type);
      eventTypeMap.set(label, (eventTypeMap.get(label) || 0) + 1);
    });

    const typeDistribution = [...eventTypeMap.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const trendData = stats?.timeline?.length
      ? stats.timeline.map((point) => ({
          label: point.label,
          attacks: point.count,
          suspicious: events.filter((event) => {
            const eventDate = new Date(event.timestamp);
            return (
              event.suspicious &&
              Number.isFinite(eventDate.getTime()) &&
              `${String(eventDate.getHours()).padStart(2, '0')}:${String(eventDate.getMinutes()).padStart(2, '0')}` ===
                point.label
            );
          }).length,
        }))
      : [];

    const analystCards = [
      {
        label: 'Total alerts',
        value: totalEvents.toLocaleString(),
        tone: 'ocean',
        detail: `${totalAttacks.toLocaleString()} attack sessions observed`,
      },
      {
        label: 'Critical queue',
        value: criticalAlerts.toLocaleString(),
        tone: 'coral',
        detail: `${severityCounts.CRITICAL || 0} critical and ${severityCounts.HIGH || 0} high`,
      },
      {
        label: 'Active sessions',
        value: activeSessions.length.toLocaleString(),
        tone: 'sea',
        detail: `${(stats?.uniqueIPs || 0).toLocaleString()} unique source IPs`,
      },
      {
        label: 'Suspicious commands',
        value: suspiciousEvents.toLocaleString(),
        tone: 'amber',
        detail: `${loginRate}% successful authentication rate`,
      },
    ];

    const statusItems = [
      {
        label: 'Sensor link',
        value: connected ? 'Live stream' : 'Offline',
        tone: connected ? 'sea' : 'coral',
      },
      {
        label: 'Events / min',
        value: stats
          ? Math.round(stats.totalEvents / Math.max(stats.uptimeSeconds / 60, 1)).toString()
          : '0',
        tone: 'ocean',
      },
      {
        label: 'Latest activity',
        value: latestEvent ? getEventLabel(latestEvent.type) : 'No activity',
        tone: latestEvent ? getToneFromSeverity(latestEvent.severityLabel) : 'sand',
      },
    ];

    const recentCriticalEvents = [...events]
      .filter((event) => severityOrder(event.severityLabel) >= 4 || event.suspicious)
      .slice(0, 6);

    return {
      severityCounts,
      trendData,
      typeDistribution,
      analystCards,
      statusItems,
      recentCriticalEvents,
    };
  }, [activeSessions.length, connected, events, stats]);

  const topBarTimestamp = new Date().toLocaleString('en-US', {
    hour12: false,
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="dashboard-view">
            <section className="hero-panel">
              <div>
                <p className="eyebrow">SOC analyst workspace</p>
                <h1>CYTTAK keeps high-noise threat telemetry readable in real time.</h1>
                <p className="hero-copy">
                  Alert flow, attacker sessions, severity trends, and command activity are now
                  organized into a tighter analyst workspace with clearer structure, balanced
                  spacing, and faster visual scanning.
                </p>
              </div>
              <div className="hero-side">
                <div className="hero-status-grid">
                  {dashboardData.statusItems.map((item) => (
                    <div key={item.label} className={`status-pill tone-${item.tone}`}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
                <div className="hero-alert-stack">
                  <p className="eyebrow">Priority watchlist</p>
                  {dashboardData.recentCriticalEvents.length ? (
                    dashboardData.recentCriticalEvents.map((event, index) => (
                      <div key={event.id || `${event.timestamp}-${index}`} className="hero-alert-item">
                        <span className={`hero-alert-marker ${getToneFromSeverity(event.severityLabel)}`} />
                        <div>
                          <strong>{event.ip || 'Unknown source'}</strong>
                          <p>{getEventLabel(event.type)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="hero-alert-empty">No critical events in the current window.</div>
                  )}
                </div>
              </div>
            </section>

            <MetricsPanel stats={stats} events={events} cards={dashboardData.analystCards} />

            <section className="dashboard-grid">
              <div className="dashboard-main">
                <div className="chart-grid">
                  <ThreatTrendChart data={dashboardData.trendData} />
                  <AlertDistributionChart data={dashboardData.typeDistribution} />
                  <SeverityChart counts={dashboardData.severityCounts} />
                  <CommandFrequencyChart data={stats?.topCommands || []} />
                </div>
                <AttackMap events={events} />
              </div>
              <div className="dashboard-side">
                <LiveFeed events={events} />
              </div>
            </section>
          </div>
        );
      case 'map':
        return (
          <div className="single-panel-view">
            <AttackMap events={events} />
          </div>
        );
      case 'sessions':
        return (
          <div className="single-panel-view">
            <SessionViewer sessions={activeSessions} events={events} />
          </div>
        );
      case 'analytics':
        return (
          <div className="analytics-view">
            <MetricsPanel stats={stats} events={events} cards={dashboardData.analystCards} compact />
            <div className="chart-grid analytics-grid">
              <ThreatTrendChart data={dashboardData.trendData} tall />
              <SeverityChart counts={dashboardData.severityCounts} />
              <AlertDistributionChart data={dashboardData.typeDistribution} />
              <CommandFrequencyChart data={stats?.topCommands || []} tall />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <AlertBanner events={events} />

      <Sidebar
        active={activeView}
        onNav={setActiveView}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((current) => !current)}
        stats={stats}
        connected={connected}
      />

      <main className="app-main">
        <div className="main-container">
          <header className="topbar">
            <div>
              <p className="eyebrow">CYTTAK threat dashboard</p>
              <h2 className="topbar-title">CYTTAK Security Operations Center</h2>
            </div>
            <div className="topbar-meta">
              <div className={`connection-chip ${connected ? 'live' : 'offline'}`}>
                <span className={`connection-dot ${connected ? '' : 'offline'}`} />
                <span>{connected ? 'Connected to stream' : 'Connection lost'}</span>
              </div>
              <div className="timestamp-chip">{topBarTimestamp}</div>
            </div>
          </header>
          <div className="content-shell">{renderView()}</div>
        </div>
      </main>
    </div>
  );
}

function getToneFromSeverity(severity) {
  switch (severity) {
    case 'CRITICAL':
    case 'HIGH':
      return 'coral';
    case 'MEDIUM':
      return 'amber';
    case 'LOW':
      return 'sea';
    default:
      return 'ocean';
  }
}
