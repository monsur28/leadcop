"use client";

import * as React from "react";
import { getAdminOverviewAction, resolveUpgradeRequestAction } from "@/features/admin/actions";
import { getPlansAction } from "@/features/plans/actions";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Layers, 
  Globe, 
  Key, 
  ArrowUpCircle,
  FileText,
  RotateCw,
  Check,
  X,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

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

interface AdminStats {
  totalUsers: number;
  pendingUpgradesCount: number;
  verifiedDomains: number;
  activeApiKeys: number;
  pendingRequests: UpgradeRequest[];
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [plans, setPlans] = React.useState<Plan[]>([]);
  
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [overviewRes, plansRes] = await Promise.all([
      getAdminOverviewAction(),
      getPlansAction()
    ]);

    if (overviewRes.success && overviewRes.data) {
      setStats(overviewRes.data as unknown as AdminStats);
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
      // Reload stats
      const overviewRes = await getAdminOverviewAction();
      if (overviewRes.success && overviewRes.data) {
        setStats(overviewRes.data as unknown as AdminStats);
      }
    } else {
      setErrorMsg(res.error || "Failed to process request.");
    }
    setActionLoading(null);
  };

  if (loading && !stats) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-24 text-center text-slate-400">
        <RotateCw className="w-8 h-8 mx-auto animate-spin mb-4 text-[#FF7A00]" />
        <p className="text-xs font-semibold">Loading admin console...</p>
      </div>
    );
  }

  const cards = [
    { name: "Total Users", value: stats?.totalUsers || 0, change: "All registrations", icon: Users, color: "text-blue-600 bg-blue-50" },
    { name: "Pending Upgrades", value: stats?.pendingUpgradesCount || 0, change: "Requires review", icon: ArrowUpCircle, color: "text-orange-600 bg-orange-50" },
    { name: "Verified Domains", value: stats?.verifiedDomains || 0, change: "Active whitelists", icon: Globe, color: "text-emerald-600 bg-emerald-50" },
    { name: "Active API Keys", value: stats?.activeApiKeys || 0, change: "Tokens in circulation", icon: Key, color: "text-indigo-600 bg-indigo-50" },
  ];

  const pendingRequests = stats?.pendingRequests || [];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Admin Console</h2>
          <p className="text-xs text-slate-500 font-medium">Real-time statistics and summary logs of the LeadCop ecosystem.</p>
        </div>
        <Button 
          onClick={loadData}
          variant="outline"
          className="rounded-xl text-xs font-semibold gap-1.5"
        >
          <RotateCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Messages */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.name}</span>
              <div className={`p-2 rounded-lg ${stat.color} shrink-0`}>
                <stat.icon className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-none mb-1">{stat.value.toLocaleString()}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Pending Upgrade Approvals</h3>
            
            {pendingRequests.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {pendingRequests.map((req) => {
                  const planName = plans.find(p => p.id === req.requestedPlanId)?.name || "Premium Tier";
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
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Links</h4>
          <div className="grid grid-cols-1 gap-2 text-xs font-semibold">
            <Link href="/admin/users" className="p-3 border border-slate-200 hover:border-orange-200 hover:bg-slate-50/50 rounded-xl flex items-center gap-2 transition-all text-slate-700">
              <Users className="w-4 h-4 text-slate-400" /> Manage Users
            </Link>
            <Link href="/admin/plans" className="p-3 border border-slate-200 hover:border-orange-200 hover:bg-slate-50/50 rounded-xl flex items-center gap-2 transition-all text-slate-700">
              <Layers className="w-4 h-4 text-slate-400" /> Pricing Tiers
            </Link>
            <Link href="/admin/blog" className="p-3 border border-slate-200 hover:border-orange-200 hover:bg-slate-50/50 rounded-xl flex items-center gap-2 transition-all text-slate-700">
              <FileText className="w-4 h-4 text-slate-400" /> CMS & Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
