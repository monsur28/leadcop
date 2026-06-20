"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  addDomainAction, 
  deleteDomainAction, 
  toggleDomainAction, 
  getUserDomainsAction,
  regenerateApiKeyAction
} from "@/features/domains/actions";
import { getDashboardOverviewAction } from "@/features/usage/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { 
  Globe, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  RotateCw,
  Activity,
  ArrowRight,
  Copy,
  Key
} from "lucide-react";

interface Domain {
  id: string;
  hostname: string;
  isActive: boolean;
  createdAt: Date;
  apiKeys?: { prefix: string }[];
  _count?: { validationLogs: number };
}

export default function DomainsPage() {
  const router = useRouter();
  const [domains, setDomains] = React.useState<Domain[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  
  const [usageStats, setUsageStats] = React.useState<any>(null);
  const [newHostname, setNewHostname] = React.useState("");
  
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const loadData = async () => {
    setLoading(true);
    const [domainsRes, usageRes] = await Promise.all([
      getUserDomainsAction(),
      getDashboardOverviewAction()
    ]);

    if (domainsRes.success && domainsRes.data) {
      const parsed = (domainsRes.data as any[]).map((d) => ({
        ...d,
        createdAt: new Date(d.createdAt),
      }));
      setDomains(parsed);
    }
    
    if (usageRes.success && usageRes.data) {
      setUsageStats(usageRes.data);
    }

    setLoading(false);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(err => console.error(err));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try { document.execCommand('copy'); } catch (err) { console.error(err); }
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading("add");

    const res = await addDomainAction({ hostname: newHostname });
    if (res.success && res.data) {
      setNewHostname("");
      setIsAddOpen(false);
      setNewlyGeneratedKey((res.data as any).rawKey);
      setSuccessMsg("Website added successfully.");
      await loadData();
    } else {
      setErrorMsg(res.error || "Failed to add website.");
    }
    setActionLoading(null);
  };

  const handleRegenerateFromCard = async (e: React.MouseEvent, domainId: string) => {
    e.stopPropagation();
    if (!confirm("Warning: Regenerating will invalidate the current API key instantly. Proceed?")) return;
    setActionLoading(domainId);
    const res = await regenerateApiKeyAction(domainId);
    if (res.success && res.data) {
      setNewlyGeneratedKey(res.data.rawKey);
      setSuccessMsg("API key regenerated successfully.");
      await loadData();
    } else {
      setErrorMsg(res.error || "Failed to regenerate API key");
    }
    setActionLoading(null);
  };

  const quotaLimit = usageStats?.subscription ? (usageStats.subscription.plan.quotaLimit + usageStats.subscription.extraCredits) : 0;
  const isUnlimited = usageStats?.subscription?.isUnlimited || false;
  const validationsUsed = usageStats?.counter?.usedValidations ?? 0;
  const globalUsagePercentage = isUnlimited ? 0 : Math.round((validationsUsed / quotaLimit) * 100) || 0; // || 0 is fine here for NaN checking if quotaLimit is 0
  const currentPlanName = usageStats?.subscription?.plan?.name || "Free";

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">Websites</h1>
          <p className="text-base text-slate-500 font-medium">Manage your protected websites and API access.</p>
        </div>
        <Button 
          onClick={() => {
            setErrorMsg(null);
            setIsAddOpen(true);
          }}
          className="bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-sm font-bold gap-2 shadow-sm h-11 px-5"
        >
          <Plus className="w-4 h-4" /> Add Website
        </Button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-[#FFF7ED] border border-[#FF7A00]/20 text-[#FF7A00] rounded-2xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Metric Cards */}
      {!loading && usageStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3 text-slate-500">
              <Globe className="w-5 h-5 text-[#FF7A00]" />
              <p className="text-[11px] font-bold uppercase tracking-wider">Total Websites</p>
            </div>
            <h4 className="text-3xl font-black text-[#0F172A]">{domains.length}</h4>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3 text-slate-500">
              <Key className="w-5 h-5 text-indigo-500" />
              <p className="text-[11px] font-bold uppercase tracking-wider">API Keys</p>
            </div>
            <h4 className="text-3xl font-black text-[#0F172A]">{domains.length}</h4>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3 text-slate-500">
              <Activity className="w-5 h-5 text-emerald-500" />
              <p className="text-[11px] font-bold uppercase tracking-wider">Monthly Usage</p>
            </div>
            <div className="flex items-baseline gap-2">
              <h4 className="text-3xl font-black text-[#0F172A]">{globalUsagePercentage}%</h4>
              <span className="text-xs font-bold text-slate-400">of quota</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3 text-slate-500">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <p className="text-[11px] font-bold uppercase tracking-wider">Current Plan</p>
            </div>
            <h4 className="text-2xl mt-1 font-black text-[#0F172A]">{currentPlanName}</h4>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center text-slate-400">
          <RotateCw className="w-10 h-10 mx-auto animate-spin mb-4 text-[#FF7A00]" />
          <p className="text-sm font-semibold">Loading websites...</p>
        </div>
      ) : domains.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {domains.map((domain) => {
            const domainValidations = domain._count?.validationLogs ?? 0;
            const usagePercent = isUnlimited ? 0 : Math.round((domainValidations / quotaLimit) * 100) || 0;
            const hasKey = domain.apiKeys && domain.apiKeys.length > 0;
            
            return (
              <div 
                key={domain.id} 
                className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 group flex flex-col relative"
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-b from-slate-50/50 to-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[14px] bg-[#FFF7ED] flex items-center justify-center shrink-0 border border-[#FF7A00]/20 text-[#FF7A00] shadow-inner">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0F172A] text-lg truncate max-w-[180px]" title={domain.hostname}>{domain.hostname}</h3>
                      <div className="flex items-center mt-1.5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                          domain.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                        )}>
                          {domain.isActive ? <><CheckCircle className="w-3 h-3" /> Active</> : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 flex-1">
                  {/* API Key */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">API Access</label>
                    <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      {hasKey ? (
                        <code className="text-sm font-mono font-bold text-[#0F172A] pl-1">{domain.apiKeys![0].prefix}••••••••</code>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium pl-1">No API Key</span>
                      )}
                      <Button 
                        variant="outline"
                        disabled={actionLoading === domain.id || !hasKey}
                        onClick={(e) => handleRegenerateFromCard(e, domain.id)}
                        className="shrink-0 rounded-lg h-8 px-3 text-[11px] font-bold bg-white text-slate-600 hover:text-[#FF7A00] hover:border-[#FF7A00]/30 transition-colors"
                      >
                        <RotateCw className={cn("w-3.5 h-3.5 mr-1.5", actionLoading === domain.id && "animate-spin")} /> 
                        Regenerate
                      </Button>
                    </div>
                  </div>

                  {/* Usage */}
                  <div>
                    <div className="flex items-end justify-between mb-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">This Month</label>
                      <span className="text-sm font-bold text-[#0F172A]">{domainValidations} / {isUnlimited ? "∞" : quotaLimit}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-1000", usagePercent >= 100 ? "bg-red-500" : "bg-[#FF7A00]")} 
                        style={{ width: `${Math.min(usagePercent, 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 mt-auto">
                  <div className="flex items-center justify-between mb-4">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created</span>
                     <span className="text-xs font-bold text-slate-600">{domain.createdAt.toLocaleDateString()}</span>
                  </div>
                  <Button 
                    onClick={() => router.push(`/dashboard/websites/${domain.id}`)}
                    className="w-full bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-sm font-bold gap-2 h-12 transition-colors shadow-sm"
                  >
                    Open Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="w-20 h-20 rounded-[20px] bg-[#FFF7ED] text-[#FF7A00] flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Globe className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-[#0F172A] mb-3">No websites added yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed font-medium">
            Add your website domain hostname to whitelist it for form submission protection and generate its API Key.
          </p>
          <Button 
            onClick={() => {
              setErrorMsg(null);
              setIsAddOpen(true);
            }}
            className="bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-sm font-bold gap-2 px-8 h-12 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add your first website
          </Button>
        </div>
      )}

      {/* Add Domain Dialog */}
      <Dialog isOpen={isAddOpen} onClose={() => {
        setIsAddOpen(false);
        setErrorMsg(null);
      }} title="Add New Website">
        <form onSubmit={handleAddDomain} className="space-y-5 pt-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Website Hostname</label>
            <Input 
              placeholder="e.g. yourcompany.com" 
              value={newHostname}
              onChange={(e) => setNewHostname(e.target.value)}
              required
              className="h-12 rounded-xl"
            />
            <p className="text-[11px] text-slate-500 font-medium">Do not include https:// or trailing slashes.</p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              className="rounded-xl text-sm font-bold h-11 px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={actionLoading === "add"}
              className="bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-sm font-bold h-11 px-5"
            >
              {actionLoading === "add" ? "Adding..." : "Add Website"}
            </Button>
          </div>
        </form>
      </Dialog>
      
      {/* Newly Generated Key Dialog */}
      <Dialog isOpen={!!newlyGeneratedKey} onClose={() => setNewlyGeneratedKey(null)} title="API Key Generated!">
        <div className="space-y-4 pt-4">
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900 mb-1">Save your key!</h4>
              <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                For security reasons, this is the <strong>only time</strong> we will show you the full API key. 
                Please copy it and store it safely. Once you close this window, it cannot be recovered.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <code className="text-base font-mono font-bold text-[#0F172A] truncate pl-1">{newlyGeneratedKey}</code>
            <Button 
              onClick={() => copyToClipboard(newlyGeneratedKey!)}
              className="shrink-0 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl h-11 w-11 p-0 shadow-sm"
            >
              {copied ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
          <div className="flex items-center justify-end pt-6">
            <Button
              type="button"
              onClick={() => setNewlyGeneratedKey(null)}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold h-11 px-8 shadow-sm"
            >
              Done
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
export const dynamic = "force-dynamic";
