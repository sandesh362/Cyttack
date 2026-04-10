import React, { useEffect, useMemo, useRef } from 'react';
import { getSeverityAppearance } from '../utils/ui';

const HONEYPOT_LAT = 40.7128;
const HONEYPOT_LON = -74.0060;

export default function AttackMap({ events }) {
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const attackLinesRef = useRef([]);
  const containerRef = useRef(null);

  const geoEvents = useMemo(() => {
    const seen = new Map();
    events.forEach((event) => {
      if (event.geo?.lat && event.geo?.lon && event.geo.country !== 'Local' && !seen.has(event.ip)) {
        seen.set(event.ip, event);
      }
    });
    return [...seen.values()].slice(0, 100);
  }, [events]);

  const recentEvents = useMemo(() => {
    return events.filter((event) => event.geo?.lat && event.geo?.lon && event.geo.country !== 'Local').slice(0, 14);
  }, [events]);

  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current || typeof window === 'undefined' || !window.L) return;

    const L = window.L;
    const map = L.map(containerRef.current, {
      center: [18, 10],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
    }).addTo(map);

    const honeypotIcon = L.divIcon({
      html: `<div style="width:16px;height:16px;border-radius:50%;background:#72a89d;border:3px solid white;box-shadow:0 0 0 8px rgba(114,168,157,0.18)"></div>`,
      iconSize: [16, 16],
      className: '',
    });

    L.marker([HONEYPOT_LAT, HONEYPOT_LON], { icon: honeypotIcon })
      .addTo(map)
      .bindPopup('<strong>Honeypot</strong><br/>Protected target node');

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapInstanceRef.current = map;
  }, []);

  useEffect(() => {
    if (!window.L || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    geoEvents.forEach((event) => {
      if (markersRef.current[event.ip]) return;
      const appearance = getSeverityAppearance(event.severityLabel);

      const icon = L.divIcon({
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${appearance.color};border:2px solid rgba(255,255,255,0.92);box-shadow:0 0 0 8px ${appearance.bg}"></div>`,
        iconSize: [12, 12],
        className: '',
      });

      markersRef.current[event.ip] = L.marker([event.geo.lat, event.geo.lon], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:170px;font-family:Segoe UI,sans-serif;color:#23405a;line-height:1.5">
            <strong>${event.ip}</strong><br/>
            ${event.geo.city || 'Unknown city'}, ${event.geo.country || 'Unknown country'}<br/>
            ${event.type}<br/>
            Severity: ${event.severityLabel || 'INFO'}
          </div>
        `);
    });
  }, [geoEvents]);

  useEffect(() => {
    if (!window.L || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    attackLinesRef.current.forEach((line) => map.removeLayer(line));
    attackLinesRef.current = [];

    recentEvents.forEach((event, index) => {
      const appearance = getSeverityAppearance(event.severityLabel);
      const line = L.polyline(
        [[event.geo.lat, event.geo.lon], [HONEYPOT_LAT, HONEYPOT_LON]],
        {
          color: appearance.color,
          weight: 2,
          opacity: 0.62 - index * 0.03,
          dashArray: '6 8',
        }
      ).addTo(map);
      attackLinesRef.current.push(line);
    });
  }, [recentEvents]);

  return (
    <section className="dashboard-panel map-shell">
      <div className="panel-header">
        <div>
          <span className="section-chip">Geo telemetry</span>
          <h3 className="panel-title">Threat origin map</h3>
          <p className="panel-copy">Unique attacker sources and recent attack paths into the monitored honeypot node.</p>
        </div>
        <div className="chart-meta">
          <span>{geoEvents.length} mapped sources</span>
          <span>{recentEvents.length} recent trajectories</span>
        </div>
      </div>
      <div className="panel-body" style={{ paddingBottom: 0 }}>
        <div className="map-frame">
          <div className="map-overlay">
            <div className="floating-note">
              <strong>Protected asset</strong>
              <p className="panel-copy">The pinned endpoint marks the honeypot receiving live inbound activity.</p>
            </div>
            {geoEvents[0] ? (
              <div className="floating-note">
                <strong>Latest source</strong>
                <p className="panel-copy">{geoEvents[0].ip} from {geoEvents[0].geo?.country || 'Unknown location'}</p>
              </div>
            ) : null}
          </div>
          <div ref={containerRef} className="map-surface" />
        </div>
      </div>
      <div className="map-footer">
        <div className="chart-legend">
          {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((label) => (
            <span key={label} className="legend-key">
              <span className="legend-swatch" style={{ background: getSeverityAppearance(label).color }} />
              {label}
            </span>
          ))}
        </div>
        <span className="muted-text">Map updates only from real events with geo metadata.</span>
      </div>
    </section>
  );
}
