// utils/helpers.js

export function formatTimestamp(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour12: false });
}

export function formatRelative(ts) {
  if (!ts) return '—';
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 5000) return 'just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

export function getSeverityColor(label) {
  switch (label) {
    case 'CRITICAL': return '#ff2020';
    case 'HIGH':     return '#ff6b35';
    case 'MEDIUM':   return '#ffc107';
    case 'LOW':      return '#4caf50';
    case 'INFO':     return '#64748b';
    default:         return '#64748b';
  }
}

export function getSeverityBg(label) {
  switch (label) {
    case 'CRITICAL': return 'rgba(255,32,32,0.12)';
    case 'HIGH':     return 'rgba(255,107,53,0.12)';
    case 'MEDIUM':   return 'rgba(255,193,7,0.10)';
    case 'LOW':      return 'rgba(76,175,80,0.10)';
    case 'INFO':     return 'rgba(100,116,139,0.10)';
    default:         return 'rgba(100,116,139,0.10)';
  }
}

export function getEventIcon(type) {
  switch (type) {
    case 'session_connect': return '⚡';
    case 'session_close':   return '✕';
    case 'login_failed':    return '🔐';
    case 'login_success':   return '🔓';
    case 'command':         return '>';
    case 'file_download':   return '↓';
    case 'port_forward':    return '⇄';
    default:                return '•';
  }
}

export function getEventLabel(type) {
  switch (type) {
    case 'session_connect': return 'SESSION';
    case 'session_close':   return 'DISCONNECT';
    case 'login_failed':    return 'AUTH FAIL';
    case 'login_success':   return 'AUTH OK';
    case 'command':         return 'CMD';
    case 'file_download':   return 'DOWNLOAD';
    case 'port_forward':    return 'PORT FWD';
    default:                return 'EVENT';
  }
}

export function maskPassword(pwd) {
  if (!pwd) return '';
  if (pwd.length <= 2) return '••';
  return pwd[0] + '•'.repeat(Math.min(pwd.length - 2, 6)) + pwd[pwd.length - 1];
}

export function truncate(str, n = 50) {
  if (!str) return '';
  return str.length > n ? str.substring(0, n) + '…' : str;
}

export function flagEmoji(countryCode) {
  if (!countryCode || countryCode === 'XX') return '🌐';
  const base = 0x1F1E6;
  const chars = countryCode.toUpperCase().split('').map(c => String.fromCodePoint(base + c.charCodeAt(0) - 65));
  return chars.join('');
}

export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(blob, filename);
}

export function downloadCSV(rows, filename) {
  const blob = new Blob([rows], { type: 'text/csv' });
  triggerDownload(blob, filename);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}