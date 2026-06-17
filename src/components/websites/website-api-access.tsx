"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Key, Copy, Check, RotateCw, AlertTriangle, AlertCircle, Loader2 } from "lucide-react";
import { regenerateApiKeyAction } from "@/features/domains/actions";
import { Dialog } from "@/components/ui/dialog";

interface WebsiteApiAccessProps {
  domainId: string;
  apiKey: {
    prefix: string;
    createdAt: Date;
  } | null;
  onKeyGenerated?: (key: string) => void;
}

export function WebsiteApiAccess({ domainId, apiKey, onKeyGenerated }: WebsiteApiAccessProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError(null);
    const res = await regenerateApiKeyAction(domainId);
    
    if (res.success && res.data) {
      setNewKey(res.data.rawKey);
      setIsConfirmOpen(false);
      if (onKeyGenerated) {
        onKeyGenerated(res.data.rawKey);
      }
    } else {
      setError(res.error || "Failed to regenerate API key");
    }
    setIsRegenerating(false);
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(err => console.error("Clipboard API failed:", err));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try { document.execCommand('copy'); } catch (err) { console.error('Fallback copy failed', err); }
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedKey = apiKey ? `${apiKey.prefix}••••••••••••••••••••` : "No API key found";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">API Access</h3>
            <p className="text-[11px] text-slate-500 font-medium">Use this key to authenticate requests from your website.</p>
          </div>
        </div>
        {!newKey && (
          <Button 
            onClick={() => setIsConfirmOpen(true)}
            variant="outline" 
            className="text-xs font-bold gap-2 text-slate-600 hover:text-slate-900"
          >
            <RotateCw className="w-3.5 h-3.5" /> Regenerate Key
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {newKey ? (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 mb-1">Save your new key!</h4>
                <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                  For security reasons, this is the only time we will show you the full API key. 
                  Please copy it and store it safely. Once you leave this page, you won't be able to see it again.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <code className="text-sm font-mono font-bold text-slate-900 truncate pl-1">{newKey}</code>
              <Button 
                onClick={() => copyToClipboard(newKey)}
                className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-9 w-9 p-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="mt-4 flex justify-end">
               <Button onClick={() => window.location.reload()} variant="outline" className="text-xs font-bold">
                 Done
               </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <code className="text-sm font-mono font-semibold text-slate-500 truncate pl-1 select-none">{maskedKey}</code>
            <Button 
              variant="outline"
              disabled
              className="shrink-0 rounded-lg h-9 w-9 p-0 bg-white border-slate-200 opacity-50 cursor-not-allowed"
              title="Full key hidden for security. Regenerate to copy."
            >
              <Copy className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        )}
      </div>

      <Dialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Regenerate API Key">
        <div className="space-y-4 pt-4">
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-900 mb-1">Warning: Breaking Action</h4>
              <p className="text-[11px] text-red-700 leading-relaxed">
                Regenerating your API key will immediately invalidate the existing key. 
                Any LeadCop integrations using the old key will instantly fail until you update them with the new key.
              </p>
            </div>
          </div>
          
          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmOpen(false)}
              disabled={isRegenerating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Yes, Regenerate Key
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
