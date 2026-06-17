"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDomainAction } from "@/features/domains/actions";
import { Globe, ArrowRight, Loader2 } from "lucide-react";

interface StepAddDomainProps {
  onNext: (domainId: string, hostname: string, rawKey: string) => void;
}

export function StepAddDomain({ onNext }: StepAddDomainProps) {
  const [hostname, setHostname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await addDomainAction({ hostname });
      if (res.success && res.data) {
        onNext(res.data.domain.id, res.data.domain.hostname, res.data.rawKey);
      } else {
        setError(res.error || "Failed to add domain. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 bg-[#FF7A00]/10 text-[#FF7A00] rounded-2xl flex items-center justify-center mb-2">
        <Globe className="w-8 h-8" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Add your website</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Enter the domain name where you plan to install LeadCop. We'll secure this domain to ensure API keys only work on your site.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 pt-4">
        <div className="space-y-1 text-left">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Domain Name</label>
          <Input 
            placeholder="e.g. example.com" 
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            className="h-12 border-slate-200 focus:border-[#FF7A00] focus:ring-[#FF7A00]/20"
            required
            disabled={isLoading}
          />
          {error && <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={!hostname || isLoading}
          className="w-full h-12 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold rounded-xl transition-all shadow-sm shadow-[#FF7A00]/20 group"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Continue <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
