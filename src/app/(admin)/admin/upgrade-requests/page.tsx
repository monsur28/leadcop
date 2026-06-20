"use client";

import * as React from "react";
import { getAdminUpgradeRequestsAction, resolveUpgradeRequestAction } from "@/features/admin/actions";
import { getPlansAction } from "@/features/plans/actions";
import { Button } from "@/components/ui/button";
import { RotateCw, ArrowUpCircle, Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
}

interface UpgradeRequest {
  id: string;
  userId: string;
  requestedPlanId: string;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminUpgradeRequestsPage() {
  const [requests, setRequests] = React.useState<UpgradeRequest[]>([]);
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [requestsRes, plansRes] = await Promise.all([
      getAdminUpgradeRequestsAction(),
      getPlansAction()
    ]);

    if (requestsRes.success && requestsRes.data) {
      setRequests(requestsRes.data as unknown as UpgradeRequest[]);
    }
    if (plansRes.success && plansRes.data) {
      setPlans(plansRes.data);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleResolveRequest = async (requestId: string, status: "APPROVED" | "REJECTED") => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading(requestId);

    const res = await resolveUpgradeRequestAction({ requestId, status });
    if (res.success) {
      setSuccessMsg(`Upgrade request successfully ${status.toLowerCase()}!`);
      await loadData();
    } else {
      setErrorMsg(res.error || "Failed to process request.");
    }
    setActionLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
<Button 
          onClick={loadData}
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
          <p className="text-xs font-semibold">Loading upgrade requests...</p>
        </div>
      ) : requests.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Requested Plan</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Requested On</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {requests.map((item) => {
                const planName = plans.find(p => p.id === item.requestedPlanId)?.name || "Premium Tier";
                return (
                  <tr key={item.id} className="hover:bg-slate-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="leading-snug">
                        <div className="font-bold text-slate-900">{item.user.name}</div>
                        <div className="text-slate-500 font-medium">{item.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{planName}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border",
                        item.status === "PENDING" && "bg-orange-50 text-orange-700 border-orange-100",
                        item.status === "APPROVED" && "bg-green-50 text-green-700 border-green-100",
                        item.status === "REJECTED" && "bg-red-50 text-red-700 border-red-100"
                      )}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleResolveRequest(item.id, "APPROVED")}
                            disabled={actionLoading === item.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2.5 py-1 text-[10px] font-bold h-7 gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </Button>
                          <Button
                            onClick={() => handleResolveRequest(item.id, "REJECTED")}
                            disabled={actionLoading === item.id}
                            variant="destructive"
                            className="rounded-lg px-2.5 py-1 text-[10px] font-bold h-7 gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium text-[11px]">No actions available</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-700 flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <ArrowUpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">No upgrade requests processed</h3>
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
