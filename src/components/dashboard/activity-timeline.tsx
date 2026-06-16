import { Globe, Key, ShieldAlert, ShieldCheck, Activity } from "lucide-react";

interface ActivityEvent {
  id: string;
  type: "DOMAIN_ADDED" | "KEY_CREATED" | "VALIDATION_PASSED" | "VALIDATION_BLOCKED";
  title: string;
  description: string;
  date: Date;
  status?: string;
}

interface ActivityTimelineProps {
  feed: ActivityEvent[];
}

export function ActivityTimeline({ feed }: ActivityTimelineProps) {
  if (!feed || feed.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center h-[350px] flex flex-col justify-center items-center shadow-sm">
        <div className="p-4 rounded-full bg-slate-50 mb-4">
          <Activity className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">No Activity Yet</h3>
        <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed mx-auto">
          Install the script on your site to see real-time events appear here.
        </p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch(type) {
      case "DOMAIN_ADDED": return <Globe className="w-3.5 h-3.5 text-blue-600" />;
      case "KEY_CREATED": return <Key className="w-3.5 h-3.5 text-indigo-600" />;
      case "VALIDATION_PASSED": return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      case "VALIDATION_BLOCKED": return <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />;
      default: return <Activity className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch(type) {
      case "DOMAIN_ADDED": return "bg-blue-50 border-blue-100";
      case "KEY_CREATED": return "bg-indigo-50 border-indigo-100";
      case "VALIDATION_PASSED": return "bg-emerald-50 border-emerald-100";
      case "VALIDATION_BLOCKED": return "bg-rose-50 border-rose-100";
      default: return "bg-slate-50 border-slate-100";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-[350px] flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="relative border-l border-slate-100 ml-3 space-y-6 pb-4">
          {feed.map((event) => (
            <div key={event.id} className="relative pl-6 group">
              <span className={`absolute -left-[13px] top-0.5 w-6 h-6 rounded-full border flex items-center justify-center ${getBgColor(event.type)}`}>
                {getIcon(event.type)}
              </span>
              
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[13px] font-bold text-slate-900">{event.title}</span>
                  <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap shrink-0">
                    {formatTimeAgo(event.date)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">{event.description}</p>
              </div>
            </div>
          ))}
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
