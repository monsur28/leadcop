"use client";

import { useState, useEffect, useTransition } from "react";
import { getPlansAction } from "@/features/plans/actions";
import { selectPlanDuringOnboardingAction } from "@/features/subscriptions/actions";
import { Check, Loader2, ArrowRight } from "lucide-react";

interface StepSelectPlanProps {
  onNext: () => void;
}

export function StepSelectPlan({ onNext }: StepSelectPlanProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => {
    getPlansAction().then(res => {
      if (res.success && res.data) {
        setPlans(res.data.filter((p: any) => p.showOnPricingPage));
      }
      setLoading(false);
    });
  }, []);

  const handleSelect = (planId: string) => {
    setError("");
    startTransition(async () => {
      const res = await selectPlanDuringOnboardingAction(planId);
      if (res.success) {
        onNext();
      } else {
        setError(res.error || "Failed to select plan.");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#FF7A00]" />
        <p className="text-sm font-semibold">Loading available plans...</p>
      </div>
    );
  }

  return (
    <div className="text-center w-full">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF7A00]/20 to-[#FF9F43]/20 text-[#FF7A00] mb-6">
        <Check className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose your plan</h2>
      <p className="text-slate-500 text-sm mb-8">
        Select a plan to start protecting your forms. You can upgrade later.
      </p>

      {error && (
        <p className="text-sm text-red-500 font-semibold mb-6 bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative flex flex-col p-6 bg-white rounded-2xl border-2 transition-all ${
              plan.isRecommended ? "border-[#FF7A00] shadow-lg shadow-orange-500/10 scale-[1.02]" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {plan.isRecommended && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FF7A00] text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                {plan.badgeText || "Recommended"}
              </div>
            )}
            
            <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 h-8">{plan.shortDescription}</p>
            
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-extrabold text-slate-900">
                ${plan.monthlyPrice}
              </span>
              <span className="text-sm font-semibold text-slate-500">/mo</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                {plan.quotaLimit.toLocaleString()} validations/mo
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                {plan.domainLimit === -1 ? "Unlimited" : plan.domainLimit} domains
              </li>
              {plan.roleDetection && (
                <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  Role-based email detection
                </li>
              )}
            </ul>

            <button
              onClick={() => handleSelect(plan.id)}
              disabled={isPending}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                plan.isRecommended 
                  ? "bg-[#FF7A00] hover:bg-[#E66E00] text-white" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-900"
              }`}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  Select {plan.name} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
