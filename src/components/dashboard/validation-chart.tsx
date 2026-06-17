"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Activity, Zap } from "lucide-react";
import Link from "next/link";
import { SectionCard } from "@/components/system/cards";
import { TOKENS } from "@/styles/design-tokens";

interface TrendData {
  date: string; // YYYY-MM-DD
  total: number;
  blocked: number;
}

interface ValidationChartProps {
  data: TrendData[];
}

export function ValidationChart({ data }: ValidationChartProps) {
  const [range, setRange] = useState<7 | 30 | 90>(30);

  // Filter data based on selected range
  const filteredData = data.slice(-range);
  const hasData = filteredData.some(d => d.total > 0);

  return (
    <SectionCard 
      title="Validation Analytics" 
      className="h-[400px]"
      headerAction={
        <div className="flex items-center bg-muted p-1 rounded-lg shrink-0">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setRange(days as 7|30|90)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                range === days 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      }
    >
      <div className="flex-1 w-full h-full relative">
        {!hasData ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <Activity className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Awaiting Your First Validation</h4>
            <p className="text-xs text-slate-500 max-w-xs mb-6 leading-relaxed">
              Install the LeadCop script on your website to start monitoring traffic and blocking disposable emails automatically.
            </p>
            <Link 
              href="/dashboard/websites"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-[#FF7A00]" /> Get Installation Code
            </Link>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#FF7A00" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getMonth()+1}/${d.getDate()}`;
                }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
              />
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="blocked" 
                stroke="#ef4444" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorBlocked)" 
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#FF7A00" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#FF7A00' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </SectionCard>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow-xl min-w-[150px]">
        <p className="caption text-muted-foreground mb-3">{label}</p>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded-sm bg-primary" /> Validations
            </span>
            <span className="text-sm font-black text-foreground">{payload[1]?.value || 0}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded-sm bg-danger" /> Blocked
            </span>
            <span className="text-sm font-black text-foreground">{payload[0]?.value || 0}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
