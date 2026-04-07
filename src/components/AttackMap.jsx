// components/AttackMap.jsx
import React, { useEffect, useRef, useMemo } from 'react';

// Leaflet is loaded via CDN script tag in index.html
// Using vanilla Leaflet to avoid SSR/import issues

const HONEYPOT_LAT = 40.7128;
const HONEYPOT_LON = -74.0060;

export default function AttackMap({ events }) {
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const attackLinesRef = useRef([]);
  const containerRef = useRef(null);

  // Get unique IPs with geo data from recent events
  const geoEvents = useMemo(() => {
    const seen = new Map();
    events.forEach(e => {
      if (e.geo && e.geo.lat && e.geo.lon && e.geo.country !== 'Local') {
        if (!seen.has(e.ip)) {
          seen.set(e.ip, { ...e });
        }
      }
    });
    return [...seen.values()].slice(0, 100);
  }, [events]);

  // Latest events for attack lines
  const recentEvents = useMemo(() => {
    return events
      .filter(e => e.geo?.lat && e.geo?.lon && e.geo.country !== 'Local')
      .slice(0, 20);
  }, [events]);

  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;
    if (typeof window === 'undefined' || !window.L) return;

    const L = window.L;

    const map = L.map(containerRef.current, {
      center: [20, 10],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
    }).addTo(map);

    // Honeypot marker
    const honeypotIcon = L.divIcon({
      html: `<div style="
        width:14px;height:14px;
        background:#1aff1a;
        border-radius:50%;
        border:2px solid #fff;
        box-shadow:0 0 12px #1aff1a, 0 0 24px #1aff1a44;
      "></div>`,
      iconSize: [14, 14],
      className: '',
    });

    L.marker([HONEYPOT_LAT, HONEYPOT_LON], { icon: honeypotIcon })
      .addTo(map)
      .bindPopup('<b style="color:#1aff1a">🛡 HONEYPOT</b><br>Target System');

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;
  }, []);

  // Update markers when geoEvents change
  useEffect(() => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    geoEvents.forEach(event => {
      const ip = event.ip;
      if (markersRef.current[ip]) return; // already plotted

      const geo = event.geo;
      const color = getSevColor(event.severityLabel);

      const icon = L.divIcon({
        html: `<div style="
          width:10px;height:10px;
          background:${color};
          border-radius:50%;
          border:1px solid ${color}88;
          box-shadow:0 0 8px ${color}88;
          animation:pulse 2s infinite;
        "></div>`,
        iconSize: [10, 10],
        className: '',
      });

      const marker = L.marker([geo.lat, geo.lon], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:monospace;font-size:11px;color:#e2e8f0;background:#0d1117;padding:8px;border-radius:4px;min-width:160px">
            <div style="color:${color};font-weight:700;margin-bottom:4px">${event.severityLabel || 'EVENT'}</div>
            <div><b>IP:</b> ${ip}</div>
            <div><b>Location:</b> ${geo.city}, ${geo.country}</div>
            <div><b>ISP:</b> ${geo.isp || '—'}</div>
            <div><b>Type:</b> ${event.type}</div>
          </div>
        `, { className: 'dark-popup' });

      markersRef.current[ip] = marker;
    });
  }, [geoEvents]);

  // Draw attack lines for new events
  useEffect(() => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove old lines
    attackLinesRef.current.forEach(l => map.removeLayer(l));
    attackLinesRef.current = [];

    // Draw lines from attacker to honeypot
    recentEvents.slice(0, 10).forEach((event, i) => {
      const geo = event.geo;
      const opacity = 1 - i * 0.08;
      const color = getSevColor(event.severityLabel);

      const line = L.polyline(
        [[geo.lat, geo.lon], [HONEYPOT_LAT, HONEYPOT_LON]],
        { color, weight: 1.5, opacity: opacity * 0.6, dashArray: '4 4' }
      ).addTo(map);

      attackLinesRef.current.push(line);
    });
  }, [recentEvents]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.title}>ATTACK ORIGIN MAP</span>
        <span style={styles.count}>{geoEvents.length} SOURCES</span>
      </div>
      <div style={styles.innerMap}>
        {geoEvents.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyTitle}>waiting for threat data...</div>
            <div style={styles.emptySubtitle}>map will populate when geo events arrive</div>
          </div>
        ) : null}
        <div ref={containerRef} style={styles.map} />
      </div>
      <div style={styles.legend}>
        {[['CRITICAL','#ff2020'],['HIGH','#ff6b35'],['MEDIUM','#ffc107'],['LOW','#4caf50']].map(([label, color]) => (
          <div key={label} style={styles.legendItem}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}` }} />
            <span style={{ color: '#64748b', fontSize: 9 }}>{label}</span>
          </div>
        ))}
        <div style={styles.legendItem}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1aff1a', boxShadow: '0 0 6px #1aff1a' }} />
          <span style={{ color: '#64748b', fontSize: 9 }}>HONEYPOT</span>
        </div>
      </div>
    </div>
  );
}

function getSevColor(label) {
  switch (label) {
    case 'CRITICAL': return '#ff2020';
    case 'HIGH':     return '#ff6b35';
    case 'MEDIUM':   return '#ffc107';
    case 'LOW':      return '#4caf50';
    default:         return '#38bdf8';
  }
}

const styles = {
  wrapper: {
    background: '#0a0a0f',
    border: '1px solid #1e293b',
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px', borderBottom: '1px solid #1e293b',
    background: '#0d1117',
  },
  title: {
    color: '#38bdf8', fontSize: 11, fontWeight: 700, letterSpacing: 2,
    fontFamily: '"JetBrains Mono", monospace',
  },
  count: {
    color: '#334155', fontSize: 10,
    fontFamily: '"JetBrains Mono", monospace',
  },
  innerMap: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
  },
  map: {
    position: 'absolute',
    inset: 0,
    minHeight: 0,
    width: '100%',
    height: '100%',
  },
  emptyState: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    color: '#94a3b8',
    zIndex: 1,
    background: 'rgba(10,14,39,0.7)',
    textAlign: 'center',
    padding: '0 20px',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#e2e8f0',
  },
  emptySubtitle: {
    fontSize: 12,
    maxWidth: 280,
  },
  legend: {
    display: 'flex', gap: 12, alignItems: 'center',
    padding: '6px 14px', background: '#0d1117',
    borderTop: '1px solid #0f172a',
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: 4 },
};