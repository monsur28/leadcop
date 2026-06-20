import * as React from "react";
import { AdminRepository } from "@/features/admin/repository";
import { Button } from "@/components/ui/button";
import { Users, Shield, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.globalRole !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await AdminRepository.getUsers();

  return (
    <div className="space-y-6">
      

      {users.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Websites</th>
                <th className="px-6 py-3">API Keys</th>
                <th className="px-6 py-3">Usage</th>
                <th className="px-6 py-3">Credits</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((item: any) => {
                const planName = item.subscription?.plan?.name || "Free";
                const websitesCount = item.domains?.length ?? 0;
                const apiKeysCount = item.domains?.reduce((acc: number, d: any) => acc + (d.apiKeys?.length ?? 0), 0) ?? 0;
                const usage = item.usageCounters?.[0];
                const usedValidations = usage?.usedValidations ?? 0;
                const quotaLimit = item.subscription?.customQuotaLimit ?? item.subscription?.plan?.quotaLimit;
                const extraCredits = item.subscription?.extraCredits ?? 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="leading-snug">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {item.name}
                          {item.globalRole === "ADMIN" && (
                            <Shield className="w-3 h-3 text-purple-600" />
                          )}
                        </div>
                        <div className="text-slate-500 font-medium">{item.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full text-[10px] border border-slate-200">
                        {planName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border",
                        (item.status || "ACTIVE") === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        item.status === "SUSPENDED" ? "bg-orange-50 text-orange-700 border-orange-100" :
                        "bg-red-50 text-red-700 border-red-100"
                      )}>
                        {item.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{websitesCount}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{apiKeysCount}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {usedValidations.toLocaleString()} / {quotaLimit === -1 ? 'Unlimited' : (quotaLimit ?? "Unavailable")}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{extraCredits.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/users/${item.id}`}>
                        <Button
                          variant="outline"
                          className="rounded-lg px-3 py-1 text-[11px] font-bold h-7 gap-1"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
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
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">No users found</h3>
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
