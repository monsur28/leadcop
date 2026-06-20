"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyIcon, Globe, ShieldCheck, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function QuickActionsPanel({ apiKey, activeDomain }: { apiKey?: string, activeDomain?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card className="border-borderSubtle shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 px-5 pt-5 bg-card border-b border-borderSubtle/50">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Environment</CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-5 space-y-6 bg-card">
          
          {/* Domain Status */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-successGhost text-success rounded-lg">
              <Globe className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground font-bold mb-1 uppercase tracking-wider">Protected Website</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{activeDomain}</span>
                {activeDomain !== "Not configured" && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-borderSubtle w-full" />

          {/* API Key */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primaryGhost text-primary rounded-lg">
              <KeyIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] text-muted-foreground font-bold mb-1 uppercase tracking-wider">Secret Key</p>
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 border border-borderSubtle group hover:border-border transition-colors">
                <code className="text-xs font-mono text-foreground flex-1 truncate">{apiKey}</code>
                <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Copy to clipboard">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      <Card className="border-borderSubtle shadow-sm rounded-2xl bg-gradient-to-b from-card to-muted/20">
        <CardHeader className="pb-3 px-5 pt-5 border-b border-borderSubtle/50">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Installation</CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-5 space-y-3">
           <Button variant="outline" className="w-full justify-start text-sm shadow-sm h-10 rounded-xl border-borderSubtle hover:bg-muted/50 font-medium">
             <ShieldCheck className="w-4 h-4 mr-2 text-primary" />
             WordPress Plugin
           </Button>
           <Button variant="default" className="w-full justify-start text-sm shadow-sm h-10 rounded-xl bg-[#081225] hover:bg-[#0F172A] text-white font-medium">
             <Globe className="w-4 h-4 mr-2 text-white/70" />
             HTML Snippet
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}
