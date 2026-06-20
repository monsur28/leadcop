import * as React from "react";
import { AdminRepository } from "@/features/admin/repository";
import { PlanRepository } from "@/features/plans/repository";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminUserClientActions } from "@/components/admin/admin-user-client-actions";
import { 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Activity, 
  ShieldAlert, 
  CreditCard,
  ArrowLeft,
  Globe,
  Key
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AdminUserDetailsPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.globalRole !== "ADMIN") {
    redirect("/dashboard");
  }

  const [user, plans] = await Promise.all([
    AdminRepository.getUserById(params.id),
    PlanRepository.getAllPlans()
  ]);

  if (!user) {
    return (
      <div className="p-8 text-center text-slate-500">
        User not found.
        <br />
        <Link href="/admin/users" className="text-orange-600 font-bold hover:underline mt-4 inline-block">Return to Users</Link>
      </div>
    );
  }

  const planName = user.subscription?.plan?.name || "No Plan";
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const usage = user.usageCounters?.find((u: any) => u.month === currentMonth && u.year === currentYear);
  const usedValidations = usage?.usedValidations ?? 0;
  const quotaLimit = user.subscription?.customQuotaLimit ?? user.subscription?.plan?.quotaLimit;
  const extraCredits = user.subscription?.extraCredits ?? 0;

  const allApiKeys = user.domains?.flatMap((d: any) => d.apiKeys || []) || [];
  const allValidationLogs = user.domains?.flatMap((d: any) => d.validationLogs || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10) || [];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col gap-4">
        <Link href="/admin/users" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 w-fit transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Users
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-1">
              {user.email}
              <span className={cn(
                "px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border",
                (user.status || "ACTIVE") === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                user.status === "SUSPENDED" ? "bg-orange-50 text-orange-700 border-orange-100" :
                "bg-red-50 text-red-700 border-red-100"
              )}>
                {user.status || "ACTIVE"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Account & Billing Quick View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Subscription</h3>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xl font-bold text-slate-900">{planName}</div>
                  <div className="text-xs text-slate-500 mt-1">Renews: {user.subscription?.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Usage</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {usedValidations.toLocaleString()} <span className="text-slate-400">/ {quotaLimit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Extra Credits</h3>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-2xl font-bold">{quotaLimit === -1 ? 'Unlimited' : (quotaLimit ?? "Unavailable")}</div>
                  <div className="text-xs text-slate-500 mt-1">Non-expiring validations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Websites */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" /> Protected Websites
            </h3>
            {user.domains && user.domains.length > 0 ? (
              <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
                {user.domains.map((domain: any) => (
                  <div key={domain.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{domain.hostname}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Created: {new Date(domain.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border",
                        domain.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                        {domain.isActive ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border rounded-xl bg-slate-50/50 text-slate-500 text-xs font-semibold">
                No websites configured.
              </div>
            )}
          </div>

          {/* API Keys */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-500" /> API Keys
            </h3>
            {allApiKeys.length > 0 ? (
              <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
                {allApiKeys.map((key: any) => (
                  <div key={key.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        {key.name}
                        <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono text-[9px] text-slate-600">{key.prefix}••••••••</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 flex gap-3">
                        <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                        <span>Type: {key.type}</span>
                        <span>Used: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </div>
                    <div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border",
                        key.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                      )}>
                        {key.isActive ? "Active" : "Revoked"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border rounded-xl bg-slate-50/50 text-slate-500 text-xs font-semibold">
                No API keys generated.
              </div>
            )}
          </div>

          {/* Validation Activity */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF7A00]" /> Recent Validation Activity
            </h3>
            {allValidationLogs.length > 0 ? (
              <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
                {allValidationLogs.map((log: any) => (
                  <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{log.validatedDomain}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border",
                        log.status === "VALID" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        log.status === "INVALID" ? "bg-red-50 text-red-700 border-red-100" :
                        "bg-orange-50 text-orange-700 border-orange-100"
                      )}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border rounded-xl bg-slate-50/50 text-slate-500 text-xs font-semibold">
                No validation activity.
              </div>
            )}
          </div>

          {/* Payments */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-500" /> Payment History
            </h3>
            {user.payments && user.payments.length > 0 ? (
              <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
                {user.payments.map((payment: any) => (
                  <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{(payment.amount / 100).toLocaleString('en-US', { style: 'currency', currency: payment.currency.toUpperCase() })}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {new Date(payment.createdAt).toLocaleDateString()} • TxID: {payment.providerTxId}
                      </div>
                    </div>
                    <div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border",
                        payment.status === "SUCCEEDED" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        payment.status === "FAILED" ? "bg-red-50 text-red-700 border-red-100" :
                        "bg-slate-100 text-slate-700 border-slate-200"
                      )}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border rounded-xl bg-slate-50/50 text-slate-500 text-xs font-semibold">
                No payment history.
              </div>
            )}
          </div>

        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Details</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-700">{user.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-700">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-700">Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Admin Client Actions Component */}
          <AdminUserClientActions user={user} plans={plans} />
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
