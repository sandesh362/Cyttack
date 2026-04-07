// components/Charts.jsx
import React, { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
  CartesianGrid, Cell,
} from 'recharts';

const CHART_BG = '#0a0a0f';
const GRID_COLOR = '#1e293b';
const TEXT_COLOR = '#475569';

function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0d1117', border: '1px solid #334155',
      borderRadius: 4, padding: '6px 10px',
      fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
    }}>
      <div style={{ color: '#64748b', marginBottom: 2 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#38bdf8' }}>
          {formatter ? formatter(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

export function TimelineChart({ data = [] }) {
  const chartData = data.map(d => ({ ...d, time: d.label }));

  return (
    <div style={styles.chartBox}>
      <div style={styles.chartHeader}>
        <span style={styles.chartTitle}>ATTACKS OVER TIME</span>
        <span style={styles.chartSub}>30min window</span>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="attackGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff2020" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ff2020" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="time" tick={{ fill: TEXT_COLOR, fontSize: 9 }}
            axisLine={false} tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fill: TEXT_COLOR, fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip formatter={v => `${v} events`} />} />
          <Area
            type="monotone" dataKey="count"
            stroke="#ff2020" strokeWidth={2}
            fill="url(#attackGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CommandFreqChart({ data = [] }) {
  const chartData = data.slice(0, 8).map(d => ({
    name: d.name.length > 20 ? d.name.substring(0, 20) + '…' : d.name,
    count: d.count,
  }));

  const COLORS = ['#ff6b35', '#ff9a5c', '#ffb380', '#ffc9a0', '#ffd9be', '#ffe6d5', '#fff0e8', '#fff8f3'];

  return (
    <div style={styles.chartBox}>
      <div style={styles.chartHeader}>
        <span style={styles.chartTitle}>COMMAND FREQUENCY</span>
        <span style={styles.chartSub}>top 8</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
          <XAxis type="number" tick={{ fill: TEXT_COLOR, fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category" dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: '"JetBrains Mono", monospace' }}
            axisLine={false} tickLine={false} width={130}
          />
          <Tooltip content={<CustomTooltip formatter={v => `${v}×`} />} />
          <Bar dataKey="count" radius={[0, 3, 3, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GeoDistChart({ data = [] }) {
  const chartData = data.slice(0, 6).map((d, i) => ({
    name: d.name,
    count: d.count,
    fill: ['#38bdf8','#818cf8','#a78bfa','#c084fc','#e879f9','#f472b6'][i],
  }));

  return (
    <div style={styles.chartBox}>
      <div style={styles.chartHeader}>
        <span style={styles.chartTitle}>GEO DISTRIBUTION</span>
        <span style={styles.chartSub}>by country</span>
      </div>
      <div style={styles.geoList}>
        {chartData.map((d, i) => (
          <div key={i} style={styles.geoRow}>
            <div style={styles.geoBarTrack}>
              <div style={{
                height: '100%',
                width: `${Math.round((d.count / (chartData[0]?.count || 1)) * 100)}%`,
                background: d.fill,
                borderRadius: 2,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <span style={{ ...styles.geoName, color: d.fill }}>{d.name}</span>
            <span style={styles.geoCount}>{d.count}</span>
          </div>
        ))}
        {chartData.length === 0 && <div style={{ color: '#1e293b', fontSize: 10 }}>awaiting geo data...</div>}
      </div>
    </div>
  );
}

export function SeverityRadial({ counts = {} }) {
  const data = [
    { name: 'CRITICAL', value: counts.CRITICAL || 0, fill: '#ff2020' },
    { name: 'HIGH',     value: counts.HIGH || 0,     fill: '#ff6b35' },
    { name: 'MEDIUM',   value: counts.MEDIUM || 0,   fill: '#ffc107' },
    { name: 'LOW',      value: counts.LOW || 0,       fill: '#4caf50' },
  ].filter(d => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div style={styles.chartBox}>
      <div style={styles.chartHeader}>
        <span style={styles.chartTitle}>THREAT LEVEL</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ResponsiveContainer width={100} height={100}>
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius={20} outerRadius={45}
            data={data.length > 0 ? data : [{ name: 'none', value: 1, fill: '#1e293b' }]}
            startAngle={180} endAngle={-180}
          >
            <RadialBar dataKey="value" cornerRadius={3} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{ flex: 1 }}>
          {data.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: d.fill }} />
              <span style={{ color: '#475569', fontSize: 9, flex: 1, fontFamily: '"JetBrains Mono", monospace' }}>{d.name}</span>
              <span style={{ color: d.fill, fontSize: 9, fontFamily: '"JetBrains Mono", monospace' }}>
                {total > 0 ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
          {data.length === 0 && <div style={{ color: '#1e293b', fontSize: 10, fontFamily: '"JetBrains Mono", monospace' }}>no data</div>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  chartBox: {
    background: '#0a0a0f',
    border: '1px solid #1e293b',
    borderRadius: 8,
    padding: '12px 14px',
    fontFamily: '"JetBrains Mono", monospace',
  },
  chartHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10,
  },
  chartTitle: { color: '#94a3b8', fontSize: 10, fontWeight: 700, letterSpacing: 2 },
  chartSub: { color: '#334155', fontSize: 9 },
  geoList: { display: 'flex', flexDirection: 'column', gap: 6 },
  geoRow: { display: 'flex', alignItems: 'center', gap: 8 },
  geoBarTrack: { flex: 1, height: 12, background: '#0d1117', borderRadius: 2, overflow: 'hidden' },
  geoName: { fontSize: 9, width: 80, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  geoCount: { color: '#475569', fontSize: 9, width: 28, textAlign: 'right' },
};