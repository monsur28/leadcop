"use client";

import * as React from "react";
import { getPlansAction } from "@/features/plans/actions";
import { 
  getMyLimitsAction, 
  getMyLimitsAction, 
  getPendingUpgradeRequestAction 
} from "@/features/subscriptions/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Check, 
  RotateCw, 
  Layers, 
  Zap, 
  AlertCircle
} from "lucide-react";

interface Plan {
  id: string;
  slug: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  quotaLimit: number;
  domainLimit: number;
  roleDetection: boolean;
  publicDetection: boolean;
  apiKeyLimit: number;
  rateLimitPerMinute: number;
  lemonMonthlyVariantId?: string;
  lemonYearlyVariantId?: string;
}

interface UserLimits {
  quotaLimit: number;
  domainLimit: number;
  roleDetection: boolean;
  publicDetection: boolean;
  apiKeyLimit: number;
  rateLimitPerMinute: number;
  subscription: {
    planId: string;
    extraCredits: number;
    isUnlimited: boolean;
    currentPeriodEnd: string;
    status: string;
    plan: {
      name: string;
      name: string;
      slug: string;
    };
    customerPortalUrl?: string;
  } | null;
}

interface PendingUpgradeRequest {
  id: string;
  userId: string;
  requestedPlanId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default function BillingPage() {
  const [loading, setLoading] = React.useState(true);
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [limits, setLimits] = React.useState<UserLimits | null>(null);
  const [pendingRequest, setPendingRequest] = React.useState<PendingUpgradeRequest | null>(null);
  
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const loadBillingData = async () => {
    setLoading(true);
    const [plansRes, limitsRes, pendingRes] = await Promise.all([
      getPlansAction(),
      getMyLimitsAction(),
      getPendingUpgradeRequestAction()
    ]);

    if (plansRes.success && plansRes.data) {
      setPlans(plansRes.data as Plan[]);
    }
    if (limitsRes.success && limitsRes.data) {
      setLimits(limitsRes.data as unknown as UserLimits);
    }
    if (pendingRes.success && pendingRes.data) {
      setPendingRequest(pendingRes.data as unknown as PendingUpgradeRequest);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadBillingData();
  }, []);

  const handleCheckout = async (variantId: string | undefined) => {
    if (!variantId) {
      setErrorMsg("This plan is not configured for self-serve checkout.");
      return;
    }
    
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading(variantId);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId })
      });
      
      const data = await res.json();
      
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setErrorMsg(data.error || "Failed to initiate checkout.");
      }
    } catch (e) {
      setErrorMsg("Network error occurred while contacting billing server.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-24 text-center text-slate-400">
        <RotateCw className="w-8 h-8 mx-auto animate-spin mb-4 text-[#FF7A00]" />
        <p className="text-xs font-semibold">Loading billing details...</p>
      </div>
    );
  }

  const currentPlanId = limits?.subscription?.planId;
  const currentPlanName = limits?.subscription?.plan?.name || "Free Sandbox";

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Plan & Billing</h2>
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">Manage your subscription, view plan features, and securely upgrade your account.</p>
          {limits?.subscription?.customerPortalUrl && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-bold"
              onClick={() => window.open(limits.subscription!.customerPortalUrl, "_blank")}
            >
              Manage Billing Details
            </Button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Current Plan Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-50 text-[#FF7A00] border border-orange-100 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Subscription</div>
              <h3 className="text-sm font-bold text-slate-800">{currentPlanName}</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Monthly Quota</span>
              <span className="font-semibold text-slate-700">
                {limits?.subscription?.isUnlimited ? "Unlimited" : `${limits?.quotaLimit.toLocaleString()} checks`}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Domains Allowed</span>
              <span className="font-semibold text-slate-700">{limits?.domainLimit === -1 ? "Unlimited" : limits?.domainLimit}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase">API Keys</span>
              <span className="font-semibold text-slate-700">{limits?.apiKeyLimit === -1 ? "Unlimited" : limits?.apiKeyLimit}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Rate Limit</span>
              <span className="font-semibold text-slate-700">{limits?.rateLimitPerMinute === -1 ? "Unlimited" : `${limits?.rateLimitPerMinute}/min`}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Role Detection</span>
              <span className="font-semibold text-slate-700">{limits?.roleDetection ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500">Subscription Status</span>
            <span className="inline-flex px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 font-bold uppercase text-[9px]">
              {limits?.subscription?.status || "ACTIVE"}
            </span>
          </div>
          {limits?.subscription?.currentPeriodEnd && (
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Period Ends</span>
              <span className="font-bold text-slate-700">
                {new Date(limits.subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pending Upgrade Alert */}
      {pendingRequest && (
        <div className="p-4 bg-orange-50/50 border border-orange-200/80 text-orange-800 rounded-2xl text-xs font-semibold flex items-start gap-2.5">
          <Zap className="w-5 h-5 text-[#FF7A00] shrink-0 mt-0.5" />
          <div>
            <strong className="block mb-0.5">Pending Upgrade Request</strong>
            You have requested an upgrade to <span className="underline">
              {plans.find(p => p.id === pendingRequest.requestedPlanId)?.name || "a premium tier"}
            </span>.
            Our team will process and update your subscription shortly.
          </div>
        </div>
      )}

      {/* Available Plans Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Available Subscription Tiers</h3>
          <p className="text-[10px] text-slate-500 font-medium">Select a tier below to upgrade your account instantly via Lemon Squeezy.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const isRequested = pendingRequest?.requestedPlanId === plan.id;

            return (
              <div 
                key={plan.id} 
                className={cn(
                  "bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-sm transition-all",
                  isCurrent 
                    ? "border-[#FF7A00] ring-1 ring-[#FF7A00]" 
                    : "border-slate-200/80 hover:border-slate-350"
                )}
              >
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800">{plan.name}</h4>
                      {isCurrent && (
                        <span className="text-[9px] bg-orange-50 text-[#FF7A00] font-bold px-1.5 py-0.5 rounded-full border border-orange-100 uppercase">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-2xl font-black text-slate-900">${plan.monthlyPrice === 0 ? "0" : (plan.monthlyPrice / 100)}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">/mo</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-3.5 text-[11px] font-medium text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
                      <span>{plan.quotaLimit.toLocaleString()} monthly checks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
                      <span>{plan.domainLimit === 9999 ? "Unlimited" : plan.domainLimit} protected domain(s)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
                      <span>{plan.roleDetection ? "Role account filters" : "No role email blocking"}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
                      <span>{plan.apiKeyLimit === -1 ? "Unlimited" : plan.apiKeyLimit} API Keys</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
                      <span>{plan.rateLimitPerMinute === -1 ? "Unlimited" : `${plan.rateLimitPerMinute} req/min`}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5">
                  {isCurrent ? (
                    <Button 
                      disabled
                      className="w-full bg-slate-100 text-slate-400 rounded-xl text-xs font-bold pointer-events-none"
                    >
                      Active Plan
                    </Button>
                  ) : isRequested ? (
                    <Button 
                      disabled
                      className="w-full bg-orange-50 text-[#FF7A00] border border-orange-100 rounded-xl text-xs font-bold pointer-events-none"
                    >
                      Request Pending
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleCheckout(plan.lemonMonthlyVariantId)}
                      disabled={actionLoading !== null}
                      className={cn(
                        "w-full rounded-xl text-xs font-bold transition-all shadow-sm",
                        plan.slug === "free"
                          ? "bg-slate-900 hover:bg-slate-800 text-white"
                          : "bg-[#FF7A00] hover:bg-[#E66E00] text-white"
                      )}
                    >
                      {actionLoading === plan.lemonMonthlyVariantId ? "Redirecting..." : "Upgrade Plan"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
