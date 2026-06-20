"use client";

import * as React from "react";
import { getAdminSubscriptionsAction, updateExtraCreditsAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCw, Layers, AlertCircle, Check } from "lucide-react";

interface SubscriptionItem {
  id: string;
  userId: string;
  planId: string;
  status: string;
  currentPeriodEnd: string;
  extraCredits: number;
  isUnlimited: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  plan: {
    name: string;
  };
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = React.useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  
  const [creditsInput, setCreditsInput] = React.useState<Record<string, number>>({});
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const loadSubscriptions = async () => {
    setLoading(true);
    const res = await getAdminSubscriptionsAction();
    if (res.success && res.data) {
      const data = res.data as unknown as SubscriptionItem[];
      setSubscriptions(data);
      // Initialize inputs mapping
      const inputs: Record<string, number> = {};
      data.forEach(item => {
        inputs[item.userId] = item.extraCredits;
      });
      setCreditsInput(inputs);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleUpdateCredits = async (userId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading(userId);

    const credits = creditsInput[userId] ?? 0;
    const res = await updateExtraCreditsAction({ userId, extraCredits: Number(credits) });

    if (res.success) {
      setSuccessMsg("Subscription credits adjusted successfully!");
      await loadSubscriptions();
    } else {
      setErrorMsg(res.error || "Failed to update credits.");
    }
    setActionLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
<Button 
          onClick={loadSubscriptions}
          variant="outline"
          className="rounded-xl text-xs font-semibold gap-1.5"
        >
          <RotateCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
          <RotateCw className="w-8 h-8 mx-auto animate-spin mb-4 text-[#FF7A00]" />
          <p className="text-xs font-semibold">Loading subscription list...</p>
        </div>
      ) : subscriptions.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Account User</th>
                <th className="px-6 py-3">Plan Package</th>
                <th className="px-6 py-3">Extra Credits</th>
                <th className="px-6 py-3">Renewal Ends</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {subscriptions.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="leading-snug">
                      <div className="font-bold text-slate-900">{item.user.name}</div>
                      <div className="text-slate-500 font-medium">{item.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {item.plan.name} {item.isUnlimited && " (Unlimited)"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 max-w-[120px]">
                      <Input
                        type="number"
                        min="0"
                        value={creditsInput[item.userId] !== undefined ? creditsInput[item.userId] : 0}
                        onChange={(e) => setCreditsInput({
                          ...creditsInput,
                          [item.userId]: Number(e.target.value)
                        })}
                        className="h-8 font-mono text-center rounded-lg"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {new Date(item.currentPeriodEnd).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      onClick={() => handleUpdateCredits(item.userId)}
                      disabled={actionLoading === item.userId}
                      className="bg-slate-900 hover:bg-slate-850 text-white rounded-lg px-2.5 py-1 text-[10px] font-bold h-7"
                    >
                      {actionLoading === item.userId ? "Saving..." : "Save Credits"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-700 flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">No active subscriptions found</h3>
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
