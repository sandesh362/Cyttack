export const SEVERITY_CONFIG = {
  CRITICAL: {
    color: '#c96c5f',
    bg: 'rgba(201, 108, 95, 0.12)',
  },
  HIGH: {
    color: '#d88a68',
    bg: 'rgba(216, 138, 104, 0.12)',
  },
  MEDIUM: {
    color: '#ddb76c',
    bg: 'rgba(221, 183, 108, 0.12)',
  },
  LOW: {
    color: '#72a89d',
    bg: 'rgba(114, 168, 157, 0.12)',
  },
  INFO: {
    color: '#6f8aa4',
    bg: 'rgba(111, 138, 164, 0.12)',
  },
  DEFAULT: {
    color: '#6f8aa4',
    bg: 'rgba(111, 138, 164, 0.12)',
  },
};

export function formatTimestamp(ts) {
  if (!ts) return '--';
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false });
}

export function formatRelative(ts) {
  if (!ts) return '--';
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 5000) return 'just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export function getSeverityAppearance(label) {
  return SEVERITY_CONFIG[label] || SEVERITY_CONFIG.DEFAULT;
}

export function getEventLabel(type) {
  switch (type) {
    case 'session_connect':
      return 'Session start';
    case 'session_close':
      return 'Session close';
    case 'login_failed':
      return 'Failed login';
    case 'login_success':
      return 'Successful login';
    case 'command':
      return 'Command';
    case 'file_download':
      return 'Download';
    case 'port_forward':
      return 'Port forward';
    default:
      return 'Event';
  }
}

export function getEventShortLabel(type) {
  switch (type) {
    case 'session_connect':
      return 'SESSION';
    case 'session_close':
      return 'CLOSE';
    case 'login_failed':
      return 'AUTH FAIL';
    case 'login_success':
      return 'AUTH OK';
    case 'command':
      return 'COMMAND';
    case 'file_download':
      return 'DOWNLOAD';
    case 'port_forward':
      return 'PORT';
    default:
      return 'EVENT';
  }
}

export function getEventIcon(type) {
  switch (type) {
    case 'session_connect':
      return 'LN';
    case 'session_close':
      return 'CL';
    case 'login_failed':
      return 'AF';
    case 'login_success':
      return 'AO';
    case 'command':
      return 'CM';
    case 'file_download':
      return 'DL';
    case 'port_forward':
      return 'PF';
    default:
      return 'EV';
  }
}

export function truncate(value, length = 60) {
  if (!value) return '';
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

export function flagEmoji(countryCode) {
  if (!countryCode || countryCode === 'XX') return 'GL';
  const base = 0x1f1e6;
  return countryCode
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(base + char.charCodeAt(0) - 65))
    .join('');
}

export function severityOrder(label) {
  switch (label) {
    case 'CRITICAL':
      return 5;
    case 'HIGH':
      return 4;
    case 'MEDIUM':
      return 3;
    case 'LOW':
      return 2;
    default:
      return 1;
  }
}

export function getEventDetail(event) {
  switch (event.type) {
    case 'login_failed':
    case 'login_success':
      return `${event.username || 'unknown'} / ${event.password || 'no password'}`;
    case 'command':
      return truncate(event.command || '', 70);
    case 'session_connect':
      return `SSH:${event.dstPort || 22}`;
    case 'session_close':
      return `Duration ${event.duration || 0}s`;
    case 'file_download':
      return event.url || event.file || 'Remote artifact fetched';
    case 'port_forward':
      return `Port ${event.dstPort || '--'}`;
    default:
      return truncate(event.message || event.type || 'Activity', 70);
  }
}
