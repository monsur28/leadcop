"use client";

import * as React from "react";
import { getAdminDomainsAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { RotateCw, Globe, CheckCircle, Clock } from "lucide-react";
interface DomainItem {
  id: string;
  userId: string;
  hostname: string;
  isActive: boolean;
  isVerified: boolean;
  verificationToken: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminDomainsPage() {
  const [domains, setDomains] = React.useState<DomainItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadDomains = async () => {
    setLoading(true);
    const res = await getAdminDomainsAction();
    if (res.success && res.data) {
      setDomains(res.data as unknown as DomainItem[]);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadDomains();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">System Domains</h2>
          <p className="text-xs text-slate-500 font-medium">Audit registered client hostnames and verification tokens.</p>
        </div>
        <Button 
          onClick={loadDomains}
          variant="outline"
          className="rounded-xl text-xs font-semibold gap-1.5"
        >
          <RotateCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
          <RotateCw className="w-8 h-8 mx-auto animate-spin mb-4 text-[#FF7A00]" />
          <p className="text-xs font-semibold">Loading domains list...</p>
        </div>
      ) : domains.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Hostname</th>
                <th className="px-6 py-3">Owner Account</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Token</th>
                <th className="px-6 py-3">Created On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {domains.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{item.hostname}</td>
                  <td className="px-6 py-4">
                    <div className="leading-snug">
                      <div className="font-semibold text-slate-800">{item.user.name}</div>
                      <div className="text-slate-400 font-medium">{item.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {item.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 font-bold text-[10px] uppercase">
                          <CheckCircle className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-bold text-[10px] uppercase">
                          <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending
                        </span>
                      )}
                      {!item.isActive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold text-[10px] uppercase">
                          Disabled
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-400 font-semibold select-all">
                    {item.verificationToken}
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
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">No domains whitelisted</h3>
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
