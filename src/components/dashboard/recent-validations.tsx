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
    <SectionCard 
      title="Recent Validations"
      className="h-[400px]"
      headerAction={
        <Link 
          href="/dashboard/usage" 
          className="caption text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-lg"
        >
          View All Logs
        </Link>
      }
    >
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-3">
          {logs.map((log) => {
            const isValid = log.status === "VALID";
            return (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${isValid ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    {isValid ? <Icon icon={ShieldCheck} sizeVariant="sm" /> : <Icon icon={ShieldAlert} sizeVariant="sm" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="body-sm font-bold text-foreground truncate max-w-[120px] sm:max-w-[180px]">
                      {log.validatedDomain}
                    </span>
                    <span className="caption truncate max-w-[120px] sm:max-w-[180px]">
                      via {log.domain.hostname}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`caption px-2 py-0.5 rounded ${isValid ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    {isValid ? "Passed" : "Blocked"}
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {formatTimeAgo(new Date(log.createdAt))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
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
