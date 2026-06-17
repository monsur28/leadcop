"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, ArrowRight, CheckCircle, Copy, Terminal, Code, Laptop, Blocks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDomainAction } from "@/features/domains/actions";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [hostname, setHostname] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Focus input automatically
  useEffect(() => {
    if (step === 1) {
      document.getElementById("onboarding-hostname")?.focus();
    }
  }, [step]);

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

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostname.trim()) return;
    
    setErrorMsg(null);
    setLoading(true);

    const res = await addDomainAction({ hostname: hostname.trim() });
    
    if (res.success && res.data) {
      setApiKey((res.data as any).rawKey);
      setStep(2);
    } else {
      setErrorMsg(res.error || "Failed to add website. Please try again.");
    }
    setLoading(false);
  };

  if (step === 1) {
    return (
      <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-10 text-center border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="w-16 h-16 rounded-[16px] bg-[#FFF7ED] flex items-center justify-center mx-auto mb-6 shadow-inner border border-[#FF7A00]/20 text-[#FF7A00]">
            <Globe className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight mb-3">
            Welcome to LeadCop
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-md mx-auto">
            Protect your first website from fake emails and spam in under 2 minutes.
          </p>
        </div>
        
        <form onSubmit={handleAddWebsite} className="p-10 space-y-6 bg-white">
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold text-center">
              {errorMsg}
            </div>
          )}
          
          <div className="space-y-3">
            <label htmlFor="onboarding-hostname" className="text-xs font-bold text-slate-700 uppercase tracking-wider block text-center">
              Website URL
            </label>
            <div className="max-w-md mx-auto">
              <Input 
                id="onboarding-hostname"
                placeholder="e.g. example.com" 
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                disabled={loading}
                required
                className="h-14 rounded-xl text-center text-lg shadow-sm"
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium text-center">
              Do not include https:// or trailing slashes.
            </p>
          </div>
          
          <div className="max-w-md mx-auto pt-4">
            <Button
              type="submit"
              disabled={loading || !hostname}
              className="w-full bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-base font-bold h-14 shadow-md transition-all group"
            >
              {loading ? "Creating..." : "Continue"} 
              {!loading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Step 2
  return (
    <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="p-10 text-center border-b border-slate-100 bg-gradient-to-b from-emerald-50/50 to-white">
        <div className="w-16 h-16 rounded-[16px] bg-emerald-100 flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-200 text-emerald-600">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight mb-3">
          Your website is protected 🎉
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium">
          {hostname} has been successfully added.
        </p>
      </div>
      
      <div className="p-8 sm:p-10 space-y-10">
        
        {/* API Key Section */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Your API Key</label>
          <div className="flex items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
            <code className="text-base sm:text-lg font-mono font-bold text-[#0F172A] truncate pl-2">{apiKey}</code>
            <Button 
              onClick={() => copyToClipboard(apiKey || "")}
              className="shrink-0 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl h-12 w-12 p-0 shadow-sm"
              title="Copy API Key"
            >
              {copied ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Keep this safe. You can access it from the dashboard later.
          </p>
        </div>

        {/* Installation Section */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Choose Your Platform</label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* React */}
            <div className="border border-slate-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Code className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900">React</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-4 h-8">
                Use our official React hook to validate inputs.
              </p>
              <div className="flex gap-2">
                 <Button onClick={() => copyToClipboard(`npm install @leadcop/react`)} variant="outline" className="w-full text-xs font-bold rounded-lg h-9">
                   Copy Snippet
                 </Button>
              </div>
            </div>

            {/* Next.js */}
            <div className="border border-slate-200 rounded-2xl p-5 hover:border-slate-900 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
                  <Terminal className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900">Next.js</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-4 h-8">
                Validate Server Actions using our SDK.
              </p>
              <div className="flex gap-2">
                 <Button onClick={() => copyToClipboard(`npm install @leadcop/next`)} variant="outline" className="w-full text-xs font-bold rounded-lg h-9">
                   Copy Snippet
                 </Button>
              </div>
            </div>

            {/* HTML */}
            <div className="border border-slate-200 rounded-2xl p-5 hover:border-orange-400 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF7A00] flex items-center justify-center shrink-0">
                  <Laptop className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900">HTML Script</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-4 h-8">
                Drop a script tag into your head.
              </p>
              <div className="flex gap-2">
                 <Button onClick={() => copyToClipboard(`<script src="https://cdn.leadcop.io/v1.js" data-key="${apiKey}"></script>`)} variant="outline" className="w-full text-xs font-bold rounded-lg h-9">
                   Copy Script
                 </Button>
              </div>
            </div>

            {/* WordPress */}
            <div className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                  <Blocks className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900">WordPress</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-4 h-8">
                Download our official WP plugin.
              </p>
              <div className="flex gap-2">
                 <Button variant="default" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg h-9">
                   Download Plugin
                 </Button>
              </div>
            </div>
            
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-4 flex-col sm:flex-row bg-slate-50 -mx-10 -mb-10 p-6 sm:px-10 rounded-b-[24px]">
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-slate-900 text-sm mb-1">Setup Complete 🚀</h4>
            <p className="text-xs text-slate-500 font-medium">Your website is now protected.</p>
          </div>
          <Button 
            onClick={() => router.push("/dashboard")}
            className="w-full sm:w-auto bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-sm font-bold h-12 px-8 shadow-sm transition-all group"
          >
            Go To Dashboard <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

      </div>
    </div>
  );
}
