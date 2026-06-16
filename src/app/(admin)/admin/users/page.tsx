"use client";

import * as React from "react";
import { getAdminUsersAction, updateUserRoleAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { RotateCw, Users, Shield, User, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  globalRole: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserAccount[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    const res = await getAdminUsersAction();
    if (res.success && res.data) {
      setUsers(res.data as unknown as UserAccount[]);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleRole = async (userId: string, currentRole: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading(userId);

    const nextRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    const res = await updateUserRoleAction({ userId, role: nextRole });

    if (res.success) {
      setSuccessMsg("User role updated successfully!");
      await loadUsers();
    } else {
      setErrorMsg(res.error || "Failed to update role.");
    }
    setActionLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Manage Users</h2>
          <p className="text-xs text-slate-500 font-medium">Audit and control user registration credentials and access permissions.</p>
        </div>
        <Button 
          onClick={loadUsers}
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
          <p className="text-xs font-semibold">Loading users list...</p>
        </div>
      ) : users.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Created On</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="leading-snug">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-slate-500 font-medium">{item.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border",
                      item.globalRole === "ADMIN" 
                        ? "bg-purple-50 text-purple-700 border-purple-100" 
                        : "bg-slate-100 text-slate-650 border-slate-200"
                    )}>
                      {item.globalRole === "ADMIN" ? <Shield className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                      {item.globalRole}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      onClick={() => handleToggleRole(item.id, item.globalRole)}
                      disabled={actionLoading === item.id}
                      variant="outline"
                      className="rounded-lg px-2.5 py-1 text-[10px] font-bold h-7"
                    >
                      {actionLoading === item.id ? "Updating..." : `Make ${item.globalRole === "ADMIN" ? "User" : "Admin"}`}
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
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">No users found</h3>
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
