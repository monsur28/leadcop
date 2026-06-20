import { ShieldAlert, ShieldCheck, Database } from "lucide-react";
import Link from "next/link";
import { SectionCard } from "@/components/system/cards";
import { Icon } from "@/components/system/icons";

interface ValidationLog {
  id: string;
  validatedDomain: string;
  status: string;
  createdAt: Date;
  domain: {
    hostname: string;
  };
}

interface RecentValidationsProps {
  logs: ValidationLog[];
}

export function RecentValidations({ logs }: RecentValidationsProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col justify-center items-center shadow-sm h-[400px]">
        <div className="p-4 rounded-full bg-slate-50 border border-slate-100 mb-4">
          <Database className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-2">No Validations Recorded</h3>
        <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed mx-auto">
          We haven't received any validation requests from your websites yet. Traffic will appear here in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-borderSubtle shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 flex items-center justify-between border-b border-borderSubtle bg-card">
        <h3 className="text-sm font-bold text-foreground">Recent Validations</h3>
        <Link 
          href="/dashboard/usage" 
          className="text-[10px] font-bold text-primary hover:text-primaryDark uppercase tracking-widest"
        >
          View All
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[360px] custom-scrollbar bg-card">
        <div className="flex flex-col">
          {logs.map((log) => {
            const isValid = log.status === "VALID";
            return (
              <div key={log.id} className="flex items-center justify-between px-5 py-3 border-b border-borderSubtle/50 last:border-0 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isValid ? 'bg-success' : 'bg-danger'}`} />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground truncate max-w-[140px] sm:max-w-[240px]">
                      {log.validatedDomain}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[140px] sm:max-w-[240px]">
                      {log.domain.hostname}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${isValid ? 'bg-successGhost text-success' : 'bg-dangerGhost text-danger'}`}>
                    {isValid ? "Passed" : "Blocked"}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground w-12 text-right">
                    {formatTimeAgo(new Date(log.createdAt))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
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
