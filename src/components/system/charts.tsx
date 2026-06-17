"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Pulling tokens manually for Recharts, but ideally we pull from design-tokens.ts
import { TOKENS } from "@/styles/design-tokens";

const COLORS = [
  TOKENS.COLORS.primary,
  TOKENS.COLORS.success,
  TOKENS.COLORS.warning,
  TOKENS.COLORS.danger,
  TOKENS.COLORS.navyLight,
  '#8b5cf6'
];

export function RevenueChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={TOKENS.COLORS.primary} stopOpacity={0.8} />
            <stop offset="95%" stopColor={TOKENS.COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: TOKENS.COLORS.textMuted }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: TOKENS.COLORS.textMuted }} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
        <Tooltip
          contentStyle={{ backgroundColor: TOKENS.COLORS.navy, borderRadius: TOKENS.RADII.md, border: 'none', boxShadow: TOKENS.SHADOWS.md, color: '#fff' }}
          labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: TOKENS.COLORS.textMuted }}
          itemStyle={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}
          formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
        />
        <Area type="monotone" dataKey="revenue" stroke={TOKENS.COLORS.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function GrowthChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: TOKENS.COLORS.textMuted }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: TOKENS.COLORS.textMuted }} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: 'transparent' }}
          contentStyle={{ backgroundColor: TOKENS.COLORS.navy, borderRadius: TOKENS.RADII.md, border: 'none', boxShadow: TOKENS.SHADOWS.md, color: '#fff' }}
          labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: TOKENS.COLORS.textMuted }}
          itemStyle={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}
          formatter={(value: any) => [value, 'Users']}
        />
        <Bar dataKey="users" fill={TOKENS.COLORS.primary} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DistributionChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: TOKENS.COLORS.navy, borderRadius: TOKENS.RADII.md, border: 'none', boxShadow: TOKENS.SHADOWS.md, color: '#fff' }}
          itemStyle={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}
          formatter={(value: any) => [value, 'Value']}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MetricBarChart({ data, dataKey, fill, valueLabel = 'Value', isCurrency = false }: { data: any[], dataKey: string, fill: string, valueLabel?: string, isCurrency?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: TOKENS.COLORS.textMuted }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: TOKENS.COLORS.textMuted }} tickLine={false} axisLine={false} tickFormatter={(val) => isCurrency ? `$${val}` : val} />
        <Tooltip
          cursor={{ fill: 'transparent' }}
          contentStyle={{ backgroundColor: TOKENS.COLORS.navy, borderRadius: TOKENS.RADII.md, border: 'none', boxShadow: TOKENS.SHADOWS.md, color: '#fff' }}
          labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: TOKENS.COLORS.textMuted }}
          itemStyle={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}
          formatter={(value: any) => [isCurrency ? `$${Number(value).toFixed(2)}` : value, valueLabel]}
        />
        <Bar dataKey={dataKey} fill={fill} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
