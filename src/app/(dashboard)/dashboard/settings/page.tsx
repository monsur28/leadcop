"use client";

import * as React from "react";
import { getCurrentUserAction, updateProfileAction, changePasswordAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  User, 
  Lock, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("profile");
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);
  
  // Profile Form States
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [image, setImage] = React.useState("");
  const [hasPassword, setHasPassword] = React.useState(true);

  // Password Form States
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const loadUserData = async () => {
    setLoading(true);
    const res = await getCurrentUserAction();
    if (res.success && res.data) {
      setName(res.data.name);
      setEmail(res.data.email);
      setImage(res.data.image || "");
      setHasPassword(res.data.hasPassword);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadUserData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading(true);

    const res = await updateProfileAction({ name, email, image: image || null });
    if (res.success) {
      setSuccessMsg("Profile updated successfully!");
    } else {
      setErrorMsg(res.error || "Failed to update profile.");
    }
    setActionLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setActionLoading(true);
    const res = await changePasswordAction({
      currentPassword: hasPassword ? currentPassword : undefined,
      newPassword,
    });

    if (res.success) {
      setSuccessMsg("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setErrorMsg(res.error || "Failed to update password.");
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-24 text-center text-slate-400">
        <RotateCw className="w-8 h-8 mx-auto animate-spin mb-4 text-[#FF7A00]" />
        <p className="text-xs font-semibold">Loading account preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header Panel */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Account Settings</h2>
        <p className="text-xs text-slate-500 font-medium">Manage your personal profile details and secure credentials.</p>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => {
        setErrorMsg(null);
        setSuccessMsg(null);
        setActiveTab(val);
      }}>
        <TabsList className="mb-4">
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="w-4 h-4" /> Profile Info
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <Lock className="w-4 h-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            {/* Avatar block */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-500 text-xl uppercase overflow-hidden shrink-0">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt={name} className="w-full h-full object-cover" />
                ) : (
                  name.substring(0, 2)
                )}
              </div>
              <div className="space-y-1.5 flex-1">
                <span className="text-xs font-bold text-slate-700">Avatar Image URL</span>
                <Input 
                  placeholder="https://example.com/avatar.jpg" 
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Full Name</label>
              <Input 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Email Address</label>
              <Input 
                type="email"
                placeholder="john@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-[10px] text-slate-400 font-medium">Changing email will require logging in again with the new credentials.</p>
            </div>

            <div className="border-t border-slate-100 pt-5 flex justify-end">
              <Button
                type="submit"
                disabled={actionLoading}
                className="bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {actionLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="security" className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            {hasPassword ? (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Current Password</label>
                <Input 
                  type="password"
                  placeholder="••••••••" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="p-3 bg-blue-50 border border-blue-150 text-blue-800 rounded-xl text-xs font-semibold">
                You currently sign in using Google. You can set a password below to sign in with your email directly.
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">New Password</label>
              <Input 
                type="password"
                placeholder="Minimum 8 characters" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Confirm New Password</label>
              <Input 
                type="password"
                placeholder="Confirm password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="border-t border-slate-100 pt-5 flex justify-end">
              <Button
                type="submit"
                disabled={actionLoading}
                className="bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {actionLoading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
export const dynamic = "force-dynamic";
