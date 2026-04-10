import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { flagEmoji, formatRelative, getEventDetail, getSeverityAppearance } from '../utils/ui';

export default function SessionViewer({ sessions = [], events = [] }) {
  const [selected, setSelected] = useState(null);
  const [replayIndex, setReplayIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const replayTimer = useRef(null);
  const terminalRef = useRef(null);

  const selectedSession = sessions.find((session) => session.session === selected) || sessions[0] || null;
  const sessionId = selected || selectedSession?.session || null;

  const sessionCommands = useMemo(() => {
    return sessionId ? events.filter((event) => event.session === sessionId && event.type === 'command') : [];
  }, [events, sessionId]);

  const displayedCommands = isReplaying ? sessionCommands.slice(0, replayIndex) : sessionCommands;

  useEffect(() => {
    if (!selected && sessions[0]) {
      setSelected(sessions[0].session);
    }
  }, [selected, sessions]);

  useEffect(() => {
    if (!isReplaying) return undefined;
    if (replayIndex >= sessionCommands.length) {
      setIsReplaying(false);
      return undefined;
    }
    replayTimer.current = setTimeout(() => setReplayIndex((value) => value + 1), 520);
    return () => clearTimeout(replayTimer.current);
  }, [isReplaying, replayIndex, sessionCommands.length]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayedCommands.length]);

  const startReplay = () => {
    setReplayIndex(0);
    setIsReplaying(true);
  };

  return (
    <section className="dashboard-panel">
      <div className="panel-header">
        <div>
          <span className="section-chip">Session review</span>
          <h3 className="panel-title">Attacker sessions and command playback</h3>
          <p className="panel-copy">Inspect active sessions, their source context, and command history without altering the underlying data flow.</p>
        </div>
        <div className="chart-meta">
          <span>{sessions.length} active sessions</span>
          <span>{sessionCommands.length} commands in selected session</span>
        </div>
      </div>
      <div className="panel-body session-layout">
        <div className="session-list">
          {sessions.map((session) => (
            <article
              key={session.session}
              className={`session-item ${session.session === sessionId ? 'active' : ''}`}
              onClick={() => {
                setSelected(session.session);
                setReplayIndex(0);
                setIsReplaying(false);
              }}
            >
              <div className="session-item-top">
                <strong>{session.ip}</strong>
                <span className="tiny-code">{flagEmoji(session.countryCode)}</span>
              </div>
              <div className="session-item-bottom">
                <div>
                  <div className="feed-meta">{session.country || 'Unknown country'}</div>
                  <div className="feed-meta">Started {formatRelative(session.startTime)}</div>
                </div>
                <div className="chart-meta">
                  <span>{session.commandCount} cmds</span>
                </div>
              </div>
            </article>
          ))}
          {!sessions.length && (
            <div className="empty-state">
              <div>
                <strong>No active sessions right now.</strong>
                Session detail will appear once the honeypot records a live connection.
              </div>
            </div>
          )}
        </div>

        <section className="dashboard-panel session-terminal soft">
          {!selectedSession ? (
            <div className="empty-state">
              <div>
                <strong>Select a session to inspect its activity.</strong>
                We will render the real command history for the chosen connection here.
              </div>
            </div>
          ) : (
            <>
              <div className="terminal-header">
                <div>
                  <strong>{selectedSession.ip}</strong>
                  <div className="feed-meta">{selectedSession.country || 'Unknown country'} • {selectedSession.session}</div>
                </div>
                <div className="session-toolbar">
                  <button className="surface-button" onClick={startReplay} disabled={!sessionCommands.length || isReplaying}>
                    {isReplaying ? 'Replaying...' : 'Replay commands'}
                  </button>
                  <span className="muted-text">{displayedCommands.length} shown</span>
                </div>
              </div>
              <div className="terminal-body" ref={terminalRef}>
                {displayedCommands.map((command, index) => {
                  const appearance = getSeverityAppearance(command.severityLabel);
                  return (
                    <motion.div
                      key={`${command.timestamp}-${index}`}
                      className="command-line"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <strong style={{ color: appearance.color }}>{command.command}</strong>
                      <span className="feed-meta">{getEventDetail(command)}</span>
                      <span className="muted-text">{formatRelative(command.timestamp)}</span>
                    </motion.div>
                  );
                })}
                {!displayedCommands.length && (
                  <div className="empty-state">
                    <div>
                      <strong>No commands captured for this session yet.</strong>
                      The panel stays wired to the real session history and will populate automatically.
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </section>
  );
}
