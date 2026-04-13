import React, { useEffect, useRef, useMemo } from 'react';

const HONEYPOT_LAT = 40.7128;
const HONEYPOT_LON = -74.0060;

const SEV_COLORS = {
CRITICAL: '#ff3b3b',
HIGH:     '#ff7a00',
MEDIUM:   '#ffaa00',
LOW:      '#00ff88',
default:  '#00ccff',
};

function getSevColor(label) {
return SEV_COLORS[label] || SEV_COLORS.default;
}

export default function AttackMap({ events }) {
const mapInstanceRef = useRef(null);
const markersRef     = useRef({});
const attackLinesRef = useRef([]);
const containerRef   = useRef(null);

const geoEvents = useMemo(() => {
const seen = new Map();
events.forEach(e => {
if (e.geo && e.geo.lat && e.geo.lon && e.geo.country !== 'Local') {
if (!seen.has(e.ip)) seen.set(e.ip, { ...e });
}
});
return [...seen.values()].slice(0, 100);
}, [events]);

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

// 🌙 Dark map
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 18,
}).addTo(map);

const honeypotIcon = L.divIcon({
  html: `<div style="
    width:14px;height:14px;
    background:#00ccff;
    border-radius:50%;
    border:2px solid #fff;
    box-shadow:0 0 12px #00ccff,0 0 25px #00ccff66;
  "></div>`,
  iconSize: [14, 14],
  className: '',
});

L.marker([HONEYPOT_LAT, HONEYPOT_LON], { icon: honeypotIcon })
  .addTo(map)
  .bindPopup('<b style="color:#00ccff">🛡 HONEYPOT</b>');

mapInstanceRef.current = map;


}, []);

useEffect(() => {
const L = window.L;
if (!L || !mapInstanceRef.current) return;
const map = mapInstanceRef.current;


geoEvents.forEach(event => {
  const ip = event.ip;
  if (markersRef.current[ip]) return;

  const geo = event.geo;
  const color = getSevColor(event.severityLabel);

  const icon = L.divIcon({
    html: `<div style="
      width:10px;height:10px;
      background:${color};
      border-radius:50%;
      box-shadow:0 0 10px ${color};
    "></div>`,
    iconSize: [10, 10],
    className: '',
  });

const marker = L.marker([geo.lat, geo.lon], { icon }).addTo(map);

const popupContent = `
  <div style="
    font-size:14px;
    color:#e6edf3;
    padding:12px;
    min-width:190px;
    line-height:1.6;
  ">
    <div style="
      font-weight:700;
      color:#00ffcc;
      margin-bottom:8px;
      font-size:15px;
    ">
      INFO
    </div>

    <div style="color:#ffffff;">
      <b style="color:#00ffaa;">IP:</b> ${ip}
    </div>

    <div style="color:#ffffff;">
      <b style="color:#00ffaa;">Location:</b> ${geo.city}, ${geo.country}
    </div>

    <div style="color:#ffffff;">
      <b style="color:#00ffaa;">Type:</b> ${event.type}
    </div>
  </div>
`;

marker.bindPopup(popupContent, {
  closeButton: false,
  offset: [0, -10],
});

// ✅ HOVER SHOW
marker.on('mouseover', function () {
  this.openPopup();
});

// ✅ HOVER HIDE
marker.on('mouseout', function () {
  this.closePopup();
});

  markersRef.current[ip] = marker;
});


}, [geoEvents]);

useEffect(() => {
const L = window.L;
if (!L || !mapInstanceRef.current) return;
const map = mapInstanceRef.current;


attackLinesRef.current.forEach(l => map.removeLayer(l));
attackLinesRef.current = [];

recentEvents.slice(0, 10).forEach((event, i) => {
  const geo = event.geo;
  const color = getSevColor(event.severityLabel);

  const line = L.polyline(
    [[geo.lat, geo.lon], [HONEYPOT_LAT, HONEYPOT_LON]],
    {
      color,
      weight: 2,
      opacity: 0.4,
      dashArray: '4 6',
    }
  ).addTo(map);

  attackLinesRef.current.push(line);
});


}, [recentEvents]);

return ( <div style={s.wrapper}>
{/* HEADER */} <div style={s.header}> <span style={s.title}>🌍 Attack Map</span> <span style={s.count}>{geoEvents.length} sources</span> </div>


  {/* MAP */}
  <div style={s.mapWrap}>
    {geoEvents.length === 0 && (
      <div style={s.empty}>
        <div style={{ fontSize: 30 }}>🗺️</div>
        <div style={{ fontSize: 16 }}>Waiting for attacks...</div>
      </div>
    )}
    <div ref={containerRef} style={s.map} />
  </div>

  {/* LEGEND */}
  <div style={s.legend}>
    {Object.entries(SEV_COLORS).slice(0,4).map(([k,v]) => (
      <div key={k} style={s.legendItem}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: v }} />
        <span>{k}</span>
      </div>
    ))}
  </div>
</div>


);
}

const s = {
wrapper: {
display: 'flex',
flexDirection: 'column',
height: '100%',
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
count: { fontSize: 13, opacity: 0.7 },

mapWrap: {
flex: 1,
position: 'relative'
},

map: {
position: 'absolute',
width: '100%',
height: '100%'
},

empty: {
position: 'absolute',
zIndex: 2,
width: '100%',
height: '100%',
display: 'flex',
flexDirection: 'column',
justifyContent: 'center',
alignItems: 'center',
background: '#05080f'
},

legend: {
display: 'flex',
gap: 16,
padding: 12,
borderTop: '1px solid #1f2a44',
fontSize: 13
},

legendItem: {
display: 'flex',
alignItems: 'center',
gap: 6
}
};
