"use client";

import * as React from "react";
import { getAdminApiKeysAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { RotateCw, Key } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiKeyItem {
  id: string;
  domainId: string;
  name: string;
  prefix: string;
  type: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  domain: {
    hostname: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export default function AdminApiKeysPage() {
  const [keys, setKeys] = React.useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadKeys = async () => {
    setLoading(true);
    const res = await getAdminApiKeysAction();
    if (res.success && res.data) {
      setKeys(res.data as unknown as ApiKeyItem[]);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadKeys();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">API Keys Audit</h2>
          <p className="text-xs text-slate-500 font-medium">Monitor and audit client public and secret tokens in circulation.</p>
        </div>
        <Button 
          onClick={loadKeys}
          variant="outline"
          className="rounded-xl text-xs font-semibold gap-1.5"
        >
          <RotateCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
          <RotateCw className="w-8 h-8 mx-auto animate-spin mb-4 text-[#FF7A00]" />
          <p className="text-xs font-semibold">Loading API keys list...</p>
        </div>
      ) : keys.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Key Name</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Prefix / ID</th>
                <th className="px-6 py-3">Domain Origin</th>
                <th className="px-6 py-3">Domain Owner</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {keys.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border",
                      item.type === "PUBLIC" 
                        ? "bg-sky-50 text-sky-700 border-sky-100" 
                        : "bg-purple-50 text-purple-700 border-purple-100"
                    )}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-400 font-semibold">{item.prefix}••••••••••••••••</td>
                  <td className="px-6 py-4 font-mono text-slate-700 font-bold">{item.domain.hostname}</td>
                  <td className="px-6 py-4">
                    <div className="leading-snug">
                      <div className="font-semibold text-slate-800">{item.domain.user.name}</div>
                      <div className="text-slate-400 font-medium">{item.domain.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border",
                      item.isActive 
                        ? "bg-green-50 text-green-700 border-green-100" 
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    )}>
                      {item.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-700 flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Key className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">No API keys generated</h3>
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
