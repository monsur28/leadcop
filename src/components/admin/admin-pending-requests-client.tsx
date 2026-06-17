"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, Check, X, AlertCircle } from "lucide-react";
import { resolveUpgradeRequestAction } from "@/features/admin/actions";
import { useRouter } from "next/navigation";

export function AdminPendingRequestsClient({ 
  pendingRequests, 
  plans 
}: { 
  pendingRequests: any[], 
  plans: any[] 
}) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const handleResolveRequest = async (requestId: string, status: "APPROVED" | "REJECTED") => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading(requestId);

    const res = await resolveUpgradeRequestAction({ requestId, status });
    if (res.success) {
      setSuccessMsg(`Upgrade request successfully ${status.toLowerCase()}!`);
      router.refresh();
    } else {
      setErrorMsg(res.error || "Failed to process request.");
    }
    setActionLoading(null);
  };

  return (
    <div>
      {successMsg && (
        <div className="mb-4 p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          {errorMsg}
        </div>
      )}
      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Pending Upgrade Approvals</h3>
      
      {pendingRequests.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {pendingRequests.map((req) => {
            const planName = plans.find((p: any) => p.id === req.requestedPlanId)?.name || "Premium Tier";
            return (
              <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-900">{req.user.name}</div>
                  <div className="text-slate-500">{req.user.email}</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">
                    Requested: <strong className="text-[#FF7A00]">{planName}</strong> • {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleResolveRequest(req.id, "APPROVED")}
                    disabled={actionLoading === req.id}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1 text-[11px] font-bold gap-1 shadow-sm h-7"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button
                    onClick={() => handleResolveRequest(req.id, "REJECTED")}
                    disabled={actionLoading === req.id}
                    variant="destructive"
                    className="rounded-lg px-3 py-1 text-[11px] font-bold gap-1 shadow-sm h-7"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400">
          <ArrowUpCircle className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-500" />
          <p className="text-xs font-semibold">All upgrade requests processed</p>
          <p className="text-[10px] text-slate-500 mt-1">New requests from upgrade forms will appear here.</p>
        </div>
      )}
    </div>
  );
}
