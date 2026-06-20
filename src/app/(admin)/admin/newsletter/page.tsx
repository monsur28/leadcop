"use client";

import * as React from "react";
import { getAdminNewsletterAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { RotateCw, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriberItem {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = React.useState<SubscriberItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadSubscribers = async () => {
    setLoading(true);
    const res = await getAdminNewsletterAction();
    if (res.success && res.data) {
      setSubscribers(res.data as unknown as SubscriberItem[]);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadSubscribers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
<Button 
          onClick={loadSubscribers}
          variant="outline"
          className="rounded-xl text-xs font-semibold gap-1.5"
        >
          <RotateCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
          <RotateCw className="w-8 h-8 mx-auto animate-spin mb-4 text-[#FF7A00]" />
          <p className="text-xs font-semibold">Loading subscribers list...</p>
        </div>
      ) : subscribers.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Email Address</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Subscribed On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {subscribers.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-slate-900">{item.email}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border",
                      item.status === "SUBSCRIBED" 
                        ? "bg-green-50 text-green-700 border-green-100" 
                        : "bg-slate-100 text-slate-600 border-slate-250"
                    )}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-700 flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Mailing list audience</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
            Verify newsletter subscribers and track Opt-In status fields.
          </p>
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
