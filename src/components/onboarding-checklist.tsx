"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ChevronRight, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingProps {
  stepsState: {
    domainAdded: boolean;
    domainVerified: boolean;
    keyGenerated: boolean;
    scriptInstalled: boolean;
  };
}

export function OnboardingChecklist({ stepsState }: OnboardingProps) {
  const [copied, setCopied] = React.useState(false);

  const steps = [
    {
      id: "add-domain",
      title: "Add your domain",
      description: "Register your website host under the Domains tab to whitelist it.",
      isComplete: stepsState.domainAdded,
      href: "/dashboard/domains",
      actionLabel: "Add Domain",
    },
    {
      id: "verify-domain",
      title: "Verify domain ownership",
      description: "Add a TXT record or HTML Meta Tag to verify you own the domain.",
      isComplete: stepsState.domainVerified,
      href: "/dashboard/domains",
      actionLabel: "Verify Domain",
    },
    {
      id: "generate-key",
      title: "Generate a Public API Key",
      description: "Create an active API key restricted to your verified domain.",
      isComplete: stepsState.keyGenerated,
      href: "/dashboard/api-keys",
      actionLabel: "Generate Key",
    },
    {
      id: "install-script",
      title: "Paste script into your website <head>",
      description: "Copy our vanilla JS snippet and paste it above your main layout form.",
      isComplete: stepsState.scriptInstalled,
      href: "#",
      actionLabel: "View Snippet",
      isCustomAction: true,
    },
  ];

  const completedCount = Object.values(stepsState).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 4) * 100);

  const copyScript = () => {
    navigator.clipboard.writeText(
      `<script src="https://cdn.leadcop.io/leadcop.js" data-api-key="lc_live_pk_your_public_api_key"></script>`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Getting Started Guide</h2>
          <p className="text-xs text-slate-500 font-medium">
            Complete these 4 quick steps to start protecting your forms in under 5 minutes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#FF7A00] h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700">{progressPercent}% complete</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={cn(
              "p-4 rounded-xl border flex flex-col justify-between transition-all",
              step.isComplete
                ? "bg-slate-50/50 border-slate-100 text-slate-500"
                : "bg-white border-slate-200/80 shadow-sm hover:border-[#FF7A00]/40"
            )}
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                {step.isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                )}
                <span className={cn("text-sm font-bold", step.isComplete ? "text-slate-500 line-through" : "text-slate-800")}>
                  {idx + 1}. {step.title}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                {step.description}
              </p>
            </div>

            {step.isCustomAction ? (
              <div className="mt-auto">
                <button
                  onClick={copyScript}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-lg transition-colors border border-transparent shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : step.actionLabel}
                </button>
              </div>
            ) : step.isComplete ? (
              <div className="mt-auto flex items-center justify-center py-2 text-xs font-bold text-green-600 gap-1">
                <Check className="w-3.5 h-3.5" /> Complete
              </div>
            ) : (
              <div className="mt-auto">
                <Link
                  href={step.href}
                  className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors border border-transparent shadow-sm"
                >
                  {step.actionLabel}
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
