// components/SessionViewer.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRelative, flagEmoji } from '../utils/helpers';

export default function SessionViewer({ sessions = [], events = [] }) {
  const [selected, setSelected] = useState(null);
  const [replayIndex, setReplayIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const termRef = useRef(null);
  const replayTimer = useRef(null);

  // Build session command history from events
  const sessionCommands = selected
    ? events.filter(e => e.session === selected && e.type === 'command')
    : [];

  const selectedSession = sessions.find(s => s.session === selected);

  function startReplay() {
    setReplayIndex(0);
    setIsReplaying(true);
  }

  useEffect(() => {
    if (!isReplaying) return;
    if (replayIndex >= sessionCommands.length) {
      setIsReplaying(false);
      return;
    }
    replayTimer.current = setTimeout(() => {
      setReplayIndex(i => i + 1);
    }, 600 + Math.random() * 400);
    return () => clearTimeout(replayTimer.current);
  }, [isReplaying, replayIndex]);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [replayIndex, selected]);

  const displayedCommands = isReplaying
    ? sessionCommands.slice(0, replayIndex)
    : sessionCommands;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>SESSION VIEWER</span>
        <span style={styles.sub}>{sessions.length} ACTIVE</span>
      </div>

      <div style={styles.body}>
        {/* Session list */}
        <div style={styles.sessionList}>
          {sessions.length === 0 && (
            <div style={styles.empty}>no active sessions</div>
          )}
          {sessions.map(s => (
            <motion.div
              key={s.session}
              style={{
                ...styles.sessionRow,
                ...(selected === s.session ? styles.sessionRowActive : {}),
              }}
              onClick={() => {
                setSelected(s.session);
                setReplayIndex(0);
                setIsReplaying(false);
              }}
              whileHover={{ background: '#0f172a' }}
            >
              <div style={styles.sessionTop}>
                <span style={styles.sessionFlag}>{flagEmoji(s.countryCode)}</span>
                <span style={styles.sessionIp}>{s.ip}</span>
                <span style={styles.sessionCmds}>{s.commandCount} cmds</span>
              </div>
              <div style={styles.sessionBot}>
                <span style={styles.sessionCountry}>{s.country}</span>
                <span style={styles.sessionTime}>{formatRelative(s.startTime)}</span>
              </div>
              {s.commandCount > 0 && (
                <div style={styles.lastCmd}>
                  &gt; {(s.lastCommands?.[s.lastCommands.length - 1] || '').substring(0, 40)}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Terminal panel */}
        <div style={styles.terminal}>
          {!selected ? (
            <div style={styles.termPlaceholder}>
              <div style={{ color: '#1aff1a', marginBottom: 8 }}>SELECT A SESSION →</div>
              <div style={{ color: '#334155', fontSize: 10 }}>click a session to view command history</div>
            </div>
          ) : (
            <>
              <div style={styles.termHeader}>
                <span style={styles.termTitle}>
                  {selectedSession?.ip} — {selectedSession?.country}
                </span>
                <div style={styles.termControls}>
                  <button
                    style={styles.replayBtn}
                    onClick={startReplay}
                    disabled={isReplaying || sessionCommands.length === 0}
                  >
                    {isReplaying ? '⟳ REPLAYING...' : '▶ REPLAY'}
                  </button>
                  {isReplaying && (
                    <span style={{ color: '#64748b', fontSize: 9 }}>
                      {replayIndex}/{sessionCommands.length}
                    </span>
                  )}
                </div>
              </div>
              <div ref={termRef} style={styles.termBody}>
                <div style={styles.termLine}>
                  <span style={{ color: '#1aff1a' }}>cowrie@honeypot</span>
                  <span style={{ color: '#475569' }}>:</span>
                  <span style={{ color: '#38bdf8' }}>~$</span>
                  <span style={{ color: '#64748b' }}> ssh {selectedSession?.ip}</span>
                </div>
                <div style={{ color: '#334155', marginBottom: 8 }}>
                  Connected. Session: {selected}
                </div>

                <AnimatePresence>
                  {displayedCommands.map((e, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={styles.cmdBlock}
                    >
                      <div style={styles.termLine}>
                        <span style={{ color: '#ff4444' }}>root</span>
                        <span style={{ color: '#475569' }}>@victim:</span>
                        <span style={{ color: '#38bdf8' }}># </span>
                        <span style={{
                          color: e.suspicious ? '#ff6b35' : '#e2e8f0',
                          fontWeight: e.suspicious ? 700 : 400,
                        }}>
                          {e.command}
                        </span>
                        {e.suspicious && <span style={{ color: '#ff6b35', marginLeft: 8 }}>⚠ ALERT</span>}
                      </div>
                      <div style={styles.cmdOutput}>
                        {getFakeOutput(e.command)}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isReplaying && (
                  <motion.div
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    style={{ color: '#1aff1a' }}
                  >▌</motion.div>
                )}

                {!isReplaying && sessionCommands.length === 0 && (
                  <div style={{ color: '#334155' }}>no commands recorded for this session</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function getFakeOutput(cmd = '') {
  const c = cmd.toLowerCase().trim();
  if (c.startsWith('uname')) return <span style={{ color: '#64748b' }}>Linux honeypot 5.15.0 #1 SMP x86_64 GNU/Linux</span>;
  if (c === 'id' || c === 'whoami') return <span style={{ color: '#64748b' }}>uid=0(root) gid=0(root) groups=0(root)</span>;
  if (c.includes('passwd') && c.includes('cat')) return <span style={{ color: '#64748b' }}>root:x:0:0:root:/root:/bin/bash<br/>daemon:x:1:1...</span>;
  if (c.includes('wget') || c.includes('curl')) return <span style={{ color: '#ffc107' }}>Connecting to remote host... [████████░░] 80%</span>;
  if (c.includes('chmod')) return null;
  if (c.includes('ps')) return <span style={{ color: '#64748b' }}>USER PID %CPU %MEM CMD<br/>root 1 0.0 0.1 /sbin/init</span>;
  return null;
}

const styles = {
  container: {
    background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: 8,
    display: 'flex', flexDirection: 'column', height: '100%',
    fontFamily: '"JetBrains Mono", monospace', overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px', background: '#0d1117', borderBottom: '1px solid #1e293b',
  },
  title: { color: '#a78bfa', fontSize: 11, fontWeight: 700, letterSpacing: 2 },
  sub: { color: '#334155', fontSize: 9 },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  sessionList: {
    width: 220, borderRight: '1px solid #1e293b',
    overflowY: 'auto', flexShrink: 0,
  },
  sessionRow: {
    padding: '10px 12px', cursor: 'pointer',
    borderBottom: '1px solid #0f172a',
    transition: 'background 0.15s',
  },
  sessionRowActive: { background: '#0f172a', borderLeft: '2px solid #a78bfa' },
  sessionTop: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 },
  sessionFlag: { fontSize: 12 },
  sessionIp: { flex: 1, color: '#38bdf8', fontSize: 10, fontWeight: 600 },
  sessionCmds: { color: '#334155', fontSize: 9 },
  sessionBot: { display: 'flex', justifyContent: 'space-between' },
  sessionCountry: { color: '#475569', fontSize: 9 },
  sessionTime: { color: '#334155', fontSize: 9 },
  lastCmd: { color: '#1aff1a', fontSize: 9, marginTop: 3, opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  empty: { color: '#1e293b', fontSize: 10, padding: '20px 12px', textAlign: 'center' },
  terminal: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  termPlaceholder: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontFamily: '"JetBrains Mono", monospace',
  },
  termHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 12px', background: '#0d1117', borderBottom: '1px solid #1e293b',
  },
  termTitle: { color: '#64748b', fontSize: 10 },
  termControls: { display: 'flex', alignItems: 'center', gap: 8 },
  replayBtn: {
    background: 'transparent', border: '1px solid #a78bfa44',
    color: '#a78bfa', fontSize: 9, padding: '3px 8px', borderRadius: 3,
    cursor: 'pointer', letterSpacing: 1,
  },
  termBody: {
    flex: 1, overflowY: 'auto', padding: '12px 14px',
    fontSize: 11, lineHeight: 1.7, color: '#e2e8f0',
    background: '#050508',
  },
  termLine: { display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 2 },
  cmdBlock: { marginBottom: 8 },
  cmdOutput: { color: '#475569', marginLeft: 16, fontSize: 10, lineHeight: 1.5 },
};