"use client";

import { ShieldCheck, ShieldAlert, Database } from "lucide-react";

interface ValidationLog {
  id: string;
  validatedDomain: string;
  status: string;
  createdAt: Date;
}

interface WebsiteRecentLogsProps {
  logs: ValidationLog[];
}

export function WebsiteRecentLogs({ logs }: WebsiteRecentLogsProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col justify-center items-center shadow-sm">
        <div className="p-4 rounded-full bg-slate-50 border border-slate-100 mb-4">
          <Database className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-2">No Validations Recorded</h3>
        <p className="text-xs text-slate-500 max-w-[280px] leading-relaxed mx-auto">
          We haven't received any validation requests from this website yet. Make sure your installation script is added to your frontend.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Recent Validations</h3>
        <p className="text-[11px] text-slate-500 font-medium">Latest email checks specifically from this website.</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 font-semibold">Email Domain Checked</th>
              <th className="pb-3 font-semibold text-center">Status</th>
              <th className="pb-3 font-semibold text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => {
              const isValid = log.status === "VALID";
              return (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 pr-4">
                    <span className="text-xs font-bold text-slate-900">{log.validatedDomain}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center justify-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isValid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {isValid ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                      {isValid ? "Passed" : "Blocked"}
                    </span>
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <span className="text-[11px] font-semibold text-slate-400">
                      {formatTimeAgo(new Date(log.createdAt))}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
