// App.jsx - Cyber Dashboard
import { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import AlertBanner from './components/AlertBanner';
import MetricsPanel from './components/MetricsPanel';
import AttackMap from './components/AttackMap';
import LiveFeed from './components/LiveFeed';
import SessionViewer from './components/SessionViewer';
import { useWebSocket } from './useWebSocket';
import './App.css';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { events, stats, connected } = useWebSocket();

  // Get active sessions for the SessionViewer
  const activeSessions = useMemo(() => {
    return stats?.activeSessions || [];
  }, [stats?.activeSessions]);

  // Map view handles responsiveness and styling
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div style={styles.twoColumn}>
            <MetricsPanel stats={stats} events={events} />
            <LiveFeed events={events} />
          </div>
        );
      case 'map':
        return <AttackMap events={events} />;
      case 'sessions':
        return <SessionViewer sessions={activeSessions} events={events} />;
      case 'analytics':
        return (
          <div style={styles.analyticsView}>
            <MetricsPanel stats={stats} events={events} />
          </div>
        );
      default:
        return <MetricsPanel stats={stats} events={events} />;
    }
  };

  return (
    <div style={styles.app}>
      {/* Alerts */}
      <AlertBanner events={events} />

      {/* Sidebar */}
      <Sidebar
        active={activeView}
        onNav={setActiveView}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        stats={stats}
      />

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.topBar}>
          <div style={styles.topBarLeft}>
            <div style={styles.statusIndicator}>
              <div
                style={{
                  ...styles.statusDot,
                  background: connected ? '#1aff1a' : '#ff2020',
                }}
              />
              <span style={styles.statusText}>
                {connected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
          </div>
          <div style={styles.topBarRight}>
            <span style={styles.timestamp}>
              {new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        </div>
        {renderView()}
      </main>
    </div>
  );
}

const styles = {
  app: {
    display: 'flex',
    height: '100vh',
    background: '#0a0e27',
    color: '#e2e8f0',
    fontFamily: '"JetBrains Mono", monospace',
  },
  main: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #0a0e27 0%, #0f1732 100%)',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderBottom: '1px solid #1e293b',
    paddingLeft: 16,
    paddingRight: 16,
    background: '#0a0a0f',
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 500,
    color: '#94a3b8',
  },
  timestamp: {
    fontSize: 11,
    color: '#64748b',
  },
 twoColumn: {
  display: 'grid',
  gridTemplateColumns: '1.3fr 1fr', // ✅ more space to Metrics
  gap: 16,
  padding: 16,
  overflow: 'auto',
  alignItems: 'start', // ✅ prevents stretch/overlap
},
  analyticsView: {
    padding: 16,
    overflow: 'auto',
  },
};