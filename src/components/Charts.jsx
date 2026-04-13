// components/Charts.jsx
import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
  CartesianGrid, Cell,
} from 'recharts';

const GRID = '#e6e9f4';
const TICK = '#9ba3be';

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e6e9f4',
      borderRadius: 8, padding: '8px 13px',
      boxShadow: '0 6px 20px rgba(30,40,90,0.10)',
      fontFamily: 'var(--font)', fontSize: 12,
    }}>
      {label && <div style={{ color: '#9ba3be', marginBottom: 3, fontSize: 11 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#4361ee', fontWeight: 700 }}>
          {formatter ? formatter(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

export function TimelineChart({ data = [] }) {
  const chartData = data.map(d => ({ ...d, time: d.label }));
  return (
    <div style={s.box}>
      <div style={s.hdr}>
        <span style={s.title}>Attacks Over Time</span>
        <span style={s.sub}>30-min window</span>
      </div>
      <div style={{ padding: '4px 4px 0' }}>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={chartData} margin={{ top: 6, right: 10, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#4361ee" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#4361ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
            <XAxis dataKey="time" tick={{ fill: TICK, fontSize: 11, fontFamily: 'var(--font)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: TICK, fontSize: 11, fontFamily: 'var(--font)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip formatter={v => `${v} events`} />} />
            <Area type="monotone" dataKey="count" stroke="#4361ee" strokeWidth={2.5} fill="url(#aGrad)" dot={false} activeDot={{ r: 4, fill: '#4361ee' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CommandFreqChart({ data = [] }) {
  const chartData = data.slice(0, 8).map(d => ({
    name: d.name.length > 22 ? d.name.substring(0, 22) + '…' : d.name,
    count: d.count,
  }));
  const COLORS = ['#4361ee','#7048e8','#0284c7','#2f9e44','#f76707','#e08900','#c2255c','#9ba3be'];
  return (
    <div style={s.box}>
      <div style={s.hdr}>
        <span style={s.title}>Command Frequency</span>
        <span style={s.sub}>top 8</span>
      </div>
      <div style={{ padding: '4px 6px 0' }}>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 42, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
            <XAxis type="number" tick={{ fill: TICK, fontSize: 11, fontFamily: 'var(--font)' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#56607e', fontSize: 11, fontFamily: 'var(--font)' }} axisLine={false} tickLine={false} width={155} />
            <Tooltip content={<ChartTooltip formatter={v => `${v} times`} />} />
            <Bar dataKey="count" radius={[0, 5, 5, 0]} maxBarSize={16}>
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function GeoBar({ item, max, color }) {
  const [hov, setHov] = useState(false);
  const pct = Math.round((item.count / (max || 1)) * 100);
  return (
    <div
      style={{ ...s.geoRow, position: 'relative' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <span style={{ ...s.geoName, color }}>{item.name}</span>
      <div style={s.geoTrack}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: 3, transition: 'width 0.55s ease',
          boxShadow: hov ? `0 0 6px ${color}55` : 'none',
        }} />
      </div>
      <span style={s.geoCnt}>{item.count}</span>
      {hov && (
        <div style={{
          position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)',
          background: '#fff', border: '1px solid var(--border)',
          borderRadius: 7, padding: '5px 12px', zIndex: 10,
          boxShadow: '0 6px 20px rgba(30,40,90,0.10)',
          fontSize: 12, color: '#1a1f3a', whiteSpace: 'nowrap',
          pointerEvents: 'none', fontFamily: 'var(--font)',
        }}>
          <strong style={{ color }}>{item.name}</strong> — {item.count} hits ({pct}%)
        </div>
      )}
    </div>
  );
}

export function GeoDistChart({ data = [] }) {
  const colors = ['#4361ee','#7048e8','#0284c7','#2f9e44','#f76707','#c2255c'];
  const chartData = data.slice(0, 6).map((d, i) => ({ ...d, color: colors[i] }));
  const max = chartData[0]?.count || 1;
  return (
    <div style={s.box}>
      <div style={s.hdr}>
        <span style={s.title}>Geo Distribution</span>
        <span style={s.sub}>by country</span>
      </div>
      <div style={{ padding: '12px 16px' }}>
        {chartData.map((d, i) => <GeoBar key={i} item={d} max={max} color={d.color} />)}
        {chartData.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>awaiting geo data…</div>}
      </div>
    </div>
  );
}

export function SeverityRadial({ counts = {} }) {
  const data = [
    { name: 'CRITICAL', value: counts.CRITICAL || 0, fill: '#e8393a' },
    { name: 'HIGH',     value: counts.HIGH || 0,     fill: '#f76707' },
    { name: 'MEDIUM',   value: counts.MEDIUM || 0,   fill: '#e08900' },
    { name: 'LOW',      value: counts.LOW || 0,       fill: '#2f9e44' },
  ].filter(d => d.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={s.box}>
      <div style={s.hdr}>
        <span style={s.title}>Threat Level</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>
        <ResponsiveContainer width={100} height={100}>
          <RadialBarChart cx="50%" cy="50%" innerRadius={20} outerRadius={46}
            data={data.length > 0 ? data : [{ name: 'none', value: 1, fill: '#e6e9f4' }]}
            startAngle={180} endAngle={-180}>
            <RadialBar dataKey="value" cornerRadius={3} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{ flex: 1 }}>
          {data.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: 12, flex: 1 }}>{d.name}</span>
              <span style={{ color: d.fill, fontSize: 13, fontWeight: 700 }}>
                {total > 0 ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
          {data.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>no data</div>}
        </div>
      </div>
    </div>
  );
}

const s = {
  box: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden',
  },
  hdr: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '13px 16px', borderBottom: '1px solid var(--border-soft)',
  },
  title: { fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' },
  sub: { fontSize: 11, color: 'var(--text-muted)' },
  geoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 },
  geoTrack: { flex: 1, height: 13, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' },
  geoName: { fontSize: 12, width: 88, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 },
  geoCnt: { color: 'var(--text-muted)', fontSize: 12, width: 32, textAlign: 'right' },
};