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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-[350px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Validation Activity</h3>
          <p className="text-xs text-slate-500 font-medium">Requests processed over time</p>
        </div>
        
        {/* Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setRange(days as 7|30|90)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                range === days 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        {filteredData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
            No activity data available for this range.
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
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
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
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-3 rounded-xl shadow-lg">
        <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">{label}</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <div className="w-2 h-2 rounded-full bg-[#FF7A00]" /> Total
            </span>
            <span className="text-xs font-bold text-slate-900">{payload[1]?.value || 0}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <div className="w-2 h-2 rounded-full bg-red-500" /> Blocked
            </span>
            <span className="text-xs font-bold text-slate-900">{payload[0]?.value || 0}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
