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
    <div className="bg-card rounded-2xl border border-borderSubtle shadow-sm overflow-hidden flex flex-col h-[360px]">
      <div className="px-5 py-4 flex items-center justify-between border-b border-borderSubtle bg-card">
        <h3 className="text-sm font-bold text-foreground">Validation Traffic</h3>
        <div className="flex items-center bg-muted/50 p-0.5 rounded-lg shrink-0 border border-borderSubtle">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setRange(days as 7|30|90)}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                range === days 
                  ? "bg-card text-foreground shadow-sm border border-borderSubtle" 
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 w-full p-5 relative bg-card">
        {!hasData ? (
          <div className="absolute inset-4 flex flex-col items-center justify-center text-center bg-muted/30 rounded-xl border border-dashed border-borderSubtle">
            <div className="w-12 h-12 bg-card shadow-sm rounded-full flex items-center justify-center mb-3 border border-borderSubtle">
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            <h4 className="text-xs font-bold text-foreground mb-1 uppercase tracking-widest">Awaiting Validations</h4>
            <p className="text-[10px] text-muted-foreground max-w-xs mb-4 leading-relaxed">
              Install the script on your website to start monitoring traffic.
            </p>
            <Link 
              href="/dashboard/websites"
              className="inline-flex items-center gap-2 bg-[#081225] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#0F172A] transition-colors uppercase tracking-widest"
            >
              <Zap className="w-3 h-3 text-primary" /> Setup Domain
            </Link>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FF7A00" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#A3A3A3', fontWeight: 600 }} 
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getMonth()+1}/${d.getDate()}`;
                }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#A3A3A3', fontWeight: 600 }}
              />
              <CartesianGrid vertical={false} stroke="#F0F0F0" strokeDasharray="3 3" />
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
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                activeDot={{ r: 5, strokeWidth: 0, fill: '#FF7A00' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
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
