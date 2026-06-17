"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { 
  updateUserStatusAction, 
  adjustUserCreditsAction, 
  changeUserPlanAction,
  updateUserRoleAction
} from "@/features/admin/actions";
import { useRouter } from "next/navigation";
import { Check, AlertCircle, Coins, ShieldAlert, Key, Globe, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminUserClientActions({ user, plans }: { user: any, plans: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const [creditsInput, setCreditsInput] = React.useState<string>("");
  const [planInput, setPlanInput] = React.useState<string>(user.subscription?.planId || "");

  const handleAction = async (actionId: string, actionFn: () => Promise<any>) => {
    setLoading(actionId);
    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await actionFn();
    if (res.success) {
      setSuccessMsg(`Action successful!`);
      router.refresh();
    } else {
      setErrorMsg(res.error || "An error occurred.");
    }
    setLoading(null);
  };

  return (
    <div className="space-y-6">
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

      {/* Credits Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Coins className="w-4 h-4 text-orange-500" /> Manage Credits
        </h3>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={loading === "grant100"}
              onClick={() => handleAction("grant100", () => adjustUserCreditsAction({ userId: user.id, action: "GRANT", amount: 100 }))}
              className="rounded-lg text-xs"
            >+100</Button>
            <Button
              variant="outline"
              disabled={loading === "grant500"}
              onClick={() => handleAction("grant500", () => adjustUserCreditsAction({ userId: user.id, action: "GRANT", amount: 500 }))}
              className="rounded-lg text-xs"
            >+500</Button>
            <Button
              variant="outline"
              disabled={loading === "grant1000"}
              onClick={() => handleAction("grant1000", () => adjustUserCreditsAction({ userId: user.id, action: "GRANT", amount: 1000 }))}
              className="rounded-lg text-xs"
            >+1000</Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input 
              type="number" 
              value={creditsInput} 
              onChange={(e) => setCreditsInput(e.target.value)} 
              placeholder="Custom Amount" 
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs w-32 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
            />
            <Button
              disabled={loading === "grantCustom" || !creditsInput}
              onClick={() => handleAction("grantCustom", () => adjustUserCreditsAction({ userId: user.id, action: "GRANT", amount: parseInt(creditsInput) }))}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold"
            >Grant</Button>
            <Button
              disabled={loading === "removeCustom" || !creditsInput}
              variant="outline"
              onClick={() => handleAction("removeCustom", () => adjustUserCreditsAction({ userId: user.id, action: "REMOVE", amount: parseInt(creditsInput) }))}
              className="rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50"
            >Remove</Button>
          </div>
          <div className="mt-2 pt-4 border-t border-slate-100">
            <Button
              variant="ghost"
              disabled={loading === "resetCredits"}
              onClick={() => handleAction("resetCredits", () => adjustUserCreditsAction({ userId: user.id, action: "RESET", amount: 0 }))}
              className="text-slate-500 hover:text-slate-700 text-xs px-0 h-auto font-medium"
            >Reset all custom credits to 0</Button>
          </div>
        </div>
      </div>

      {/* Plan Management */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-500" /> Plan Management
        </h3>
        <div className="flex items-center gap-3">
          <select 
            value={planInput}
            onChange={(e) => setPlanInput(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-xs w-full max-w-[200px] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
          >
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name} (${plan.monthlyPrice}/mo)</option>
            ))}
          </select>
          <Button
            disabled={loading === "changePlan" || planInput === user.subscription?.planId}
            onClick={() => handleAction("changePlan", () => changeUserPlanAction({ userId: user.id, planId: planInput }))}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 py-2 text-xs font-bold"
          >Change Plan</Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-200/60 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-red-600 mb-4 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> Danger Zone
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-xl border border-red-100">
            <div>
              <div className="font-bold text-slate-900 text-xs">Account Status</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Suspend this user to block access and validation requests.</div>
            </div>
            {(!user.status || user.status === "ACTIVE") ? (
              <Button
                disabled={loading === "suspend"}
                variant="destructive"
                onClick={() => handleAction("suspend", () => updateUserStatusAction({ userId: user.id, status: "SUSPENDED" }))}
                className="rounded-lg px-4 py-1.5 text-xs font-bold"
              >Suspend Account</Button>
            ) : (
              <Button
                disabled={loading === "reactivate"}
                onClick={() => handleAction("reactivate", () => updateUserStatusAction({ userId: user.id, status: "ACTIVE" }))}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-1.5 text-xs font-bold"
              >Reactivate Account</Button>
            )}
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
            <div>
              <div className="font-bold text-slate-900 text-xs">Admin Role</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Grant or revoke admin dashboard access.</div>
            </div>
            <Button
              disabled={loading === "toggleRole"}
              variant="outline"
              onClick={() => handleAction("toggleRole", () => updateUserRoleAction({ userId: user.id, role: user.globalRole === "ADMIN" ? "USER" : "ADMIN" }))}
              className="rounded-lg px-4 py-1.5 text-xs font-bold"
            >
              {user.globalRole === "ADMIN" ? "Revoke Admin" : "Make Admin"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50">
            <div>
              <div className="font-bold text-red-900 text-xs">Delete User</div>
              <div className="text-[11px] text-red-700/80 mt-0.5">Permanently mark this user as deleted.</div>
            </div>
            <Button
              disabled={loading === "delete"}
              variant="destructive"
              onClick={() => {
                if (confirm("Are you sure you want to mark this user as deleted?")) {
                  handleAction("delete", () => updateUserStatusAction({ userId: user.id, status: "DELETED" }));
                }
              }}
              className="rounded-lg px-4 py-1.5 text-xs font-bold"
            >Delete User</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
