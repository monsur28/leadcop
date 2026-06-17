"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Key, Copy, Check, ArrowRight, AlertCircle } from "lucide-react";

interface StepGenerateKeyProps {
  domainId: string;
  rawKey: string;
  onNext: (key: string) => void;
}

export function StepGenerateKey({ domainId, rawKey, onNext }: StepGenerateKeyProps) {
  const [copiedKey, setCopiedKey] = useState(false);

  const copyToClipboard = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(rawKey).catch(err => console.error("Clipboard API failed:", err));
    } else {
      // Fallback for non-secure contexts (e.g., non-localhost HTTP)
      const textArea = document.createElement("textarea");
      textArea.value = rawKey;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      document.body.removeChild(textArea);
    }
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
        <Key className="w-8 h-8" />
      </div>
      
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Your API Key</h2>
        <p className="text-slate-500 text-sm">
          We've automatically generated a public API key for your domain. You'll need this key for the installation snippet.
        </p>
      </div>

      <div className="w-full space-y-6">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-left">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900 mb-1">Save this key now!</h4>
            <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
              For security reasons, this is the only time we will show you the full API key. 
              Please copy it and store it somewhere safe.
            </p>
          </div>
        </div>

        <div className="space-y-2 text-left">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Your Public Key</label>
          <div className="font-mono font-bold text-slate-900 flex items-center justify-between gap-2 bg-slate-50 p-2 border border-slate-200 rounded-xl text-sm">
            <span className="truncate px-2">{rawKey}</span>
            <button 
              onClick={copyToClipboard}
              className="p-2 hover:bg-slate-200/50 rounded-lg text-slate-500 hover:text-slate-800 shrink-0 bg-white border border-slate-200 shadow-sm transition-colors"
            >
              {copiedKey ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button 
          onClick={() => onNext(rawKey)}
          className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm group"
        >
          Continue to Installation <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
