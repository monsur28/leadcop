"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, PowerOff, Activity, ShieldAlert, Key, Globe, Copy, RefreshCw, Trash2, Code, Terminal, Laptop, Blocks } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { WebsiteIntegrationControls } from "@/components/websites/website-integration-controls";
import { WebsiteRecentLogs } from "@/components/websites/website-recent-logs";
import { regenerateApiKeyAction, deleteDomainAction } from "@/features/domains/actions";
import { useRouter } from "next/navigation";

export function WebsiteDetailsClient({
  domain,
  apiKey,
  subscription,
  domainValidationsThisMonth,
  recentLogs,
}: any) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const totalQuota = subscription ? (subscription.plan.quotaLimit + subscription.extraCredits) : 1000;
  const isUnlimited = subscription?.isUnlimited || false;
  const usagePercent = isUnlimited ? 0 : Math.round((domainValidationsThisMonth / totalQuota) * 100) || 0;

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

  const handleRegenerateKey = async () => {
    if (!confirm("Warning: Regenerating will invalidate your current API key instantly. This will break your existing integrations. Proceed?")) return;
    setActionLoading("regenerate");
    const res = await regenerateApiKeyAction(domain.id);
    if (res.success) {
      alert("API Key regenerated successfully. Check the websites dashboard to copy it.");
      router.refresh();
    } else {
      alert(res.error || "Failed to regenerate API key");
    }
    setActionLoading(null);
  };

  const handleDeleteDomain = async () => {
    if (!confirm("Warning: This will permanently delete this website and all its validation logs. Proceed?")) return;
    setActionLoading("delete");
    const res = await deleteDomainAction({ domainId: domain.id });
    if (res.success) {
      router.push("/dashboard/websites");
    } else {
      alert(res.error || "Failed to delete website");
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Link */}
      <Link 
        href="/dashboard/websites" 
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Websites
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[14px] bg-[#FFF7ED] flex items-center justify-center shrink-0 border border-[#FF7A00]/20 text-[#FF7A00] shadow-inner">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1 font-mono">
              {domain.hostname}
            </h1>
            <p className="text-xs text-slate-500 font-medium">Added on {new Date(domain.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="shrink-0">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${domain.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
            {domain.isActive ? (
              <><CheckCircle className="w-4 h-4" /> Active</>
            ) : (
              <><PowerOff className="w-4 h-4" /> Disabled</>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full flex-wrap sm:w-auto h-auto">
          <TabsTrigger value="overview" className="flex-1 sm:flex-none">Overview</TabsTrigger>
          <TabsTrigger value="installation" className="flex-1 sm:flex-none">Installation</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 sm:flex-none">Analytics</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 sm:flex-none">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Key className="w-4 h-4 text-indigo-500" /> API Access</h3>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Public Key Prefix</p>
                   <code className="text-base font-mono font-bold text-[#0F172A]">{apiKey?.prefix}••••••••</code>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Usage This Month</h3>
              <div className="flex items-end justify-between mb-3">
                <span className="text-3xl font-black text-[#0F172A]">{domainValidationsThisMonth} <span className="text-sm font-bold text-slate-400">/ {isUnlimited ? "∞" : totalQuota}</span></span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 bg-[#FF7A00]"
                  style={{ width: `${Math.min(usagePercent, 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="installation">
           <div className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-2">Integration Snippets</h3>
              <p className="text-sm text-slate-500 mb-6">Use these snippets to integrate LeadCop into your application.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* HTML */}
                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Laptop className="w-5 h-5 text-[#FF7A00]" />
                    <h4 className="font-bold text-slate-900">HTML Script</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                     <code className="flex-1 text-xs font-mono bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto text-slate-700 whitespace-nowrap">
                       &lt;script src="https://cdn.leadcop.io/v1.js"&gt;&lt;/script&gt;
                     </code>
                     <Button variant="outline" className="shrink-0 h-11" onClick={() => copyToClipboard('<script src="https://cdn.leadcop.io/v1.js"></script>')}>
                       Copy
                     </Button>
                  </div>
                </div>

                {/* React */}
                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="w-5 h-5 text-blue-500" />
                    <h4 className="font-bold text-slate-900">React Hook</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                     <code className="flex-1 text-xs font-mono bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto text-slate-700 whitespace-nowrap">
                       npm install @leadcop/react
                     </code>
                     <Button variant="outline" className="shrink-0 h-11" onClick={() => copyToClipboard('npm install @leadcop/react')}>
                       Copy
                     </Button>
                  </div>
                </div>

                {/* Next.js */}
                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Terminal className="w-5 h-5 text-slate-900" />
                    <h4 className="font-bold text-slate-900">Next.js</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                     <code className="flex-1 text-xs font-mono bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto text-slate-700 whitespace-nowrap">
                       npm install @leadcop/next
                     </code>
                     <Button variant="outline" className="shrink-0 h-11" onClick={() => copyToClipboard('npm install @leadcop/next')}>
                       Copy
                     </Button>
                  </div>
                </div>

                {/* WordPress */}
                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Blocks className="w-5 h-5 text-indigo-500" />
                    <h4 className="font-bold text-slate-900">WordPress</h4>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 rounded-lg">
                      Download Plugin
                    </Button>
                  </div>
                </div>

              </div>
           </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 gap-6">
            <WebsiteRecentLogs logs={recentLogs} />
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Regenerate API Key</h3>
                <p className="text-sm text-slate-500 max-w-lg">If your API key is compromised, you can regenerate it. This instantly invalidates the old key and breaks existing integrations.</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleRegenerateKey}
                disabled={actionLoading === "regenerate"}
                className="shrink-0 text-slate-700 font-bold h-11 px-6 rounded-xl hover:text-[#FF7A00] hover:border-[#FF7A00]/30"
              >
                {actionLoading === "regenerate" ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Regenerate Key
              </Button>
            </div>

            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-red-50/30">
              <div>
                <h3 className="font-bold text-red-700 mb-1">Delete Website</h3>
                <p className="text-sm text-red-500/80 max-w-lg">Permanently delete this website and all associated validation logs. This action cannot be undone.</p>
              </div>
              <Button 
                onClick={handleDeleteDomain}
                disabled={actionLoading === "delete"}
                className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-bold h-11 px-6 rounded-xl shadow-sm"
              >
                {actionLoading === "delete" ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete Website
              </Button>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
