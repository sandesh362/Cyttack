import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRelative, flagEmoji } from '../utils/helpers';

export default function SessionViewer({ sessions = [], events = [] }) {
const [selected, setSelected] = useState(null);
const [replayIndex, setReplayIndex] = useState(0);
const [isReplaying, setIsReplaying] = useState(false);
const termRef = useRef(null);
const replayTimer = useRef(null);

const sessionCommands = selected ? events.filter(e => e.session === selected && e.type === 'command') : [];
const selectedSession = sessions.find(s => s.session === selected);

function startReplay() { setReplayIndex(0); setIsReplaying(true); }

useEffect(() => {
if (!isReplaying) return;
if (replayIndex >= sessionCommands.length) { setIsReplaying(false); return; }
replayTimer.current = setTimeout(() => setReplayIndex(i => i + 1), 500);
return () => clearTimeout(replayTimer.current);
}, [isReplaying, replayIndex]);

useEffect(() => {
if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
}, [replayIndex, selected]);

const displayedCommands = isReplaying ? sessionCommands.slice(0, replayIndex) : sessionCommands;

return ( <div style={s.container}> <div style={s.header}> <span style={s.title}>Session Viewer</span> <span style={s.sub}>{sessions.length} active</span> </div>


  <div style={s.body}>
    {/* LEFT PANEL */}
    <div style={s.list}>
      {sessions.length === 0 && <div style={s.empty}>No active sessions</div>}

      {sessions.map(sess => (
        <motion.div
          key={sess.session}
          style={{ ...s.sessRow, ...(selected === sess.session ? s.sessActive : {}) }}
          onClick={() => { setSelected(sess.session); setReplayIndex(0); setIsReplaying(false); }}
          whileHover={{ scale: 1.02, background: '#111a2e' }}
        >
          <div style={s.rowTop}>
            <span style={s.flag}>{flagEmoji(sess.countryCode)}</span>
            <span style={s.sessIp}>{sess.ip}</span>
            <span style={s.sessCmds}>{sess.commandCount} cmds</span>
          </div>

          <div style={s.rowBottom}>
            <span>{sess.country}</span>
            <span>{formatRelative(sess.startTime)}</span>
          </div>

          {/* FULL COMMAND ON HOVER */}
          <div style={s.lastCmd} title={sess.lastCommands?.slice(-1)}>
            › {(sess.lastCommands?.slice(-1) || '')}
          </div>
        </motion.div>
      ))}
    </div>

    {/* TERMINAL */}
    <div style={s.terminal}>
      {!selected ? (
        <div style={s.placeholder}>
          <div style={{ fontSize: 32 }}>⚡</div>
          <div style={{ fontSize: 16 }}>Select a session</div>
        </div>
      ) : (
        <>
          <div style={s.termHeader}>
            <div style={s.termHeaderLeft}>
              <div style={s.termDot} />
              <span style={s.termTitle}>
                {selectedSession?.ip} — {selectedSession?.country}
              </span>
            </div>

            <button
              style={{ ...s.replayBtn, ...(isReplaying ? s.replayingBtn : {}) }}
              onClick={startReplay}
              disabled={isReplaying || sessionCommands.length === 0}
            >
              {isReplaying ? '⟳ Replaying…' : '▶ Replay'}
            </button>
          </div>

          <div ref={termRef} style={s.termBody}>
            <div style={s.connectLine}>
              honeypot:~$ ssh {selectedSession?.ip}
            </div>

            <AnimatePresence>
              {displayedCommands.map((e, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={s.commandBlock}
                >
                  <div style={s.termLine}>
                    <span style={s.root}>root@victim:</span>
                    <span style={s.cmd}>{e.command}</span>

                    {e.suspicious && (
                      <span style={s.alert}>⚠ ALERT</span>
                    )}
                  </div>

                  <div style={s.termOutput}>
                    {getFakeOutput(e.command)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isReplaying && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                style={s.cursor}
              >
                ▌
              </motion.span>
            )}

            {!isReplaying && sessionCommands.length === 0 && (
              <div style={s.noData}>No commands recorded</div>
            )}
          </div>
        </>
      )}
    </div>
  </div>
</div>


);
}

/* OUTPUT */
function getFakeOutput(cmd = '') {
const c = cmd.toLowerCase();
if (c.includes('uname')) return 'Linux Ubuntu 5.15 x86_64';
if (c.includes('whoami')) return 'root';
if (c.includes('ps')) return 'PID 1 /sbin/init';
return '';
}

/* STYLES */
const s = {
container: {
display: 'flex',
flexDirection: 'column',
height: '100%',
minHeight: 0,
background: '#0a0f1c',
border: '1px solid #1f2a44',
borderRadius: 12,
overflow: 'hidden'
},

header: {
padding: '14px 18px',
fontSize: 18,
fontWeight: 'bold',
borderBottom: '1px solid #1f2a44'
},

title: { fontSize: 18 },
sub: { fontSize: 13, opacity: 0.7 },

body: {
display: 'flex',
flex: 1,
minHeight: 0
},

list: {
width: 260,
overflowY: 'auto',
borderRight: '1px solid #1f2a44'
},

sessRow: {
padding: 14,
cursor: 'pointer',
borderBottom: '1px solid #1f2a44',
transition: '0.3s'
},

sessActive: {
background: '#111a2e'
},

rowTop: {
display: 'flex',
justifyContent: 'space-between',
fontSize: 15
},

rowBottom: {
display: 'flex',
justifyContent: 'space-between',
fontSize: 13,
opacity: 0.7
},

sessIp: { color: '#00ffcc', fontWeight: 700 },
sessCmds: { fontSize: 12 },

lastCmd: {
marginTop: 6,
fontSize: 14,
color: '#00ffaa',
whiteSpace: 'nowrap',
overflow: 'hidden',
textOverflow: 'ellipsis'
},

terminal: {
flex: 1,
display: 'flex',
flexDirection: 'column',
minHeight: 0
},

termHeader: {
padding: 12,
display: 'flex',
justifyContent: 'space-between',
borderBottom: '1px solid #1f2a44'
},

termHeaderLeft: {
display: 'flex',
alignItems: 'center',
gap: 8
},

termDot: {
width: 10,
height: 10,
borderRadius: '50%',
background: '#00ff88',
boxShadow: '0 0 10px #00ff88'
},

termTitle: {
fontSize: 15
},

replayBtn: {
padding: '6px 12px',
background: '#00ffcc',
border: 'none',
borderRadius: 6,
cursor: 'pointer',
fontWeight: 'bold'
},

replayingBtn: {
background: '#555'
},

termBody: {
flex: 1,
overflowY: 'auto',
padding: 16,
fontSize: 15,
fontFamily: 'monospace',
background: '#05080f'
},

connectLine: {
marginBottom: 10,
color: '#00ffaa'
},

commandBlock: {
marginBottom: 14
},

termLine: {
display: 'flex',
gap: 10
},

root: {
color: '#ff4d4f',
fontWeight: 'bold'
},

cmd: {
color: '#e6edf3'
},

alert: {
background: '#ff4d4f',
color: '#fff',
padding: '2px 8px',
borderRadius: 6,
fontSize: 12
},

termOutput: {
marginLeft: 20,
color: '#9ca3af',
fontSize: 14
},

cursor: {
color: '#00ffcc',
fontSize: 18
},

noData: {
color: '#888',
fontSize: 14
},

empty: {
padding: 20,
textAlign: 'center',
color: '#777'
},

placeholder: {
display: 'flex',
justifyContent: 'center',
alignItems: 'center',
flexDirection: 'column',
height: '100%'
}
};
