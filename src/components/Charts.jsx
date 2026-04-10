import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getSeverityAppearance } from '../utils/ui';

const GRID = '#d8e2ea';
const AXIS = '#6f8aa4';
const TONES = ['#7db2cf', '#84c2bb', '#d7c2a6', '#cf7f6d', '#d8b06a'];

function ChartCard({ title, subtitle, children, legend }) {
  return (
    <section className="dashboard-panel chart-shell">
      <div className="panel-header">
        <div>
          <span className="section-chip">Visualization</span>
          <h3 className="panel-title">{title}</h3>
          <p className="panel-copy">{subtitle}</p>
        </div>
        {legend ? <div className="chart-legend">{legend}</div> : null}
      </div>
      <div className="panel-body" style={{ height: 320 }}>{children}</div>
    </section>
  );
}

function TooltipCard({ active, payload, label, valueSuffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={styles.tooltip}>
      {label ? <strong style={styles.tooltipLabel}>{label}</strong> : null}
      {payload.map((entry) => (
        <div key={entry.dataKey || entry.name} style={{ ...styles.tooltipRow, color: entry.color || 'var(--text)' }}>
          <span>{entry.name || entry.dataKey}</span>
          <strong>{entry.value}{valueSuffix}</strong>
        </div>
      ))}
    </div>
  );
}

export function ThreatTrendChart({ data = [] }) {
  const legend = [
    { label: 'All alerts', color: '#7db2cf' },
    { label: 'Suspicious', color: '#cf7f6d' },
  ];

  return (
    <ChartCard
      title="Threat trend over time"
      subtitle="Minute-by-minute volume from the current live telemetry window."
      legend={legend.map((item) => (
        <span key={item.label} className="legend-key">
          <span className="legend-swatch" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 4 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7db2cf" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#7db2cf" stopOpacity={0.06} />
            </linearGradient>
            <linearGradient id="suspiciousFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cf7f6d" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#cf7f6d" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
          <Tooltip content={<TooltipCard valueSuffix=" alerts" />} />
          <Area type="monotone" dataKey="attacks" name="All alerts" stroke="#7db2cf" fill="url(#trendFill)" strokeWidth={3} />
          <Area type="monotone" dataKey="suspicious" name="Suspicious" stroke="#cf7f6d" fill="url(#suspiciousFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function AlertDistributionChart({ data = [] }) {
  return (
    <ChartCard
      title="Alert distribution"
      subtitle="Most frequent alert categories in the current event set."
      legend={data.map((item, index) => (
        <span key={item.name} className="legend-key">
          <span className="legend-swatch" style={{ background: TONES[index % TONES.length] }} />
          {item.name}
        </span>
      ))}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={72}
            outerRadius={108}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={TONES[index % TONES.length]} />
            ))}
          </Pie>
          <Tooltip content={<TooltipCard valueSuffix=" alerts" />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function SeverityChart({ counts = {} }) {
  const data = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map((label) => ({
    name: label,
    value: counts[label] || 0,
    color: getSeverityAppearance(label).color,
  }));

  return (
    <ChartCard
      title="Severity levels"
      subtitle="Current severity mix across the aggregated event stream."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 6 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<TooltipCard valueSuffix=" alerts" />} />
          <Bar dataKey="value" radius={[10, 10, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CommandFrequencyChart({ data = [] }) {
  const chartData = data.slice(0, 6).map((item) => ({
    name: item.name.length > 26 ? `${item.name.slice(0, 26)}...` : item.name,
    count: item.count,
  }));

  return (
    <ChartCard
      title="Command frequency"
      subtitle="Most common commands executed in active attacker sessions."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 12, left: 22, bottom: 4 }}>
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis type="number" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={150} />
          <Tooltip content={<TooltipCard valueSuffix=" uses" />} />
          <Bar dataKey="count" radius={[0, 12, 12, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={TONES[index % TONES.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

const styles = {
  tooltip: {
    minWidth: 170,
    padding: '12px 14px',
    borderRadius: 18,
    background: 'rgba(255, 255, 255, 0.94)',
    border: '1px solid rgba(145, 169, 190, 0.22)',
    boxShadow: '0 14px 32px rgba(117, 146, 168, 0.14)',
  },
  tooltipLabel: {
    display: 'block',
    marginBottom: 8,
    color: 'var(--text)',
    fontSize: '0.88rem',
  },
  tooltipRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    fontSize: '0.84rem',
  },
};
