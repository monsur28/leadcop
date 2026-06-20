"use client";

import * as React from "react";
import { getPlansAction, createPlanAction, updatePlanAction, togglePlanAction } from "@/features/plans/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { RotateCw, Package, Plus, Pencil, AlertCircle, Check, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanItem {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
  monthlyPrice: number;
  yearlyPrice: number;
  quotaLimit: number;
  domainLimit: number;
  apiKeyLimit: number;
  rateLimitPerMinute: number;
  roleDetection: boolean;
  publicDetection: boolean;
  customBlocklist: boolean;
  lemonSqueezyProductId?: string | null;
  lemonMonthlyVariantId?: string | null;
  lemonYearlyVariantId?: string | null;
  createdAt: string;
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  monthlyPrice: 0,
  yearlyPrice: 0,
  quotaLimit: 0,
  domainLimit: 0,
  apiKeyLimit: 0,
  rateLimitPerMinute: 60,
  roleDetection: false,
  publicDetection: false,
  customBlocklist: false,
  lemonSqueezyProductId: "",
  lemonMonthlyVariantId: "",
  lemonYearlyVariantId: "",
};

export default function AdminPlansPage() {
  const [plans, setPlans] = React.useState<PlanItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<PlanItem | null>(null);
  const [form, setForm] = React.useState(EMPTY_FORM);

  const loadPlans = async () => {
    setLoading(true);
    const res = await getPlansAction(true);
    if (res.success && res.data) {
      setPlans(res.data as unknown as PlanItem[]);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadPlans();
  }, []);

  const handleCreatePlan = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading("create");

    const res = await createPlanAction({
      ...form,
      monthlyPrice: Math.round(Number(form.monthlyPrice) * 100),
      yearlyPrice: Math.round(Number(form.yearlyPrice) * 100),
      quotaLimit: Number(form.quotaLimit),
      domainLimit: Number(form.domainLimit),
      apiKeyLimit: Number(form.apiKeyLimit),
      rateLimitPerMinute: Number(form.rateLimitPerMinute),
    });

    if (res.success) {
      setSuccessMsg("Plan created successfully!");
      setIsCreateOpen(false);
      setForm(EMPTY_FORM);
      await loadPlans();
    } else {
      setErrorMsg(res.error || "Failed to create plan.");
    }
    setActionLoading(null);
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading("update");

    const res = await updatePlanAction({
      id: editingPlan.id,
      ...form,
      monthlyPrice: Math.round(Number(form.monthlyPrice) * 100),
      yearlyPrice: Math.round(Number(form.yearlyPrice) * 100),
      quotaLimit: Number(form.quotaLimit),
      domainLimit: Number(form.domainLimit),
      apiKeyLimit: Number(form.apiKeyLimit),
      rateLimitPerMinute: Number(form.rateLimitPerMinute),
    });

    if (res.success) {
      setSuccessMsg("Plan updated successfully!");
      setEditingPlan(null);
      setForm(EMPTY_FORM);
      await loadPlans();
    } else {
      setErrorMsg(res.error || "Failed to update plan.");
    }
    setActionLoading(null);
  };

  const handleTogglePlan = async (planId: string, currentActive: boolean) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading(planId);

    const res = await togglePlanAction({ id: planId, isActive: !currentActive });
    if (res.success) {
      setSuccessMsg(`Plan ${!currentActive ? "activated" : "deactivated"} successfully!`);
      await loadPlans();
    } else {
      setErrorMsg(res.error || "Failed to toggle plan status.");
    }
    setActionLoading(null);
  };

  const openEditDialog = (plan: PlanItem) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      monthlyPrice: plan.monthlyPrice / 100,
      yearlyPrice: plan.yearlyPrice / 100,
      quotaLimit: plan.quotaLimit,
      domainLimit: plan.domainLimit,
      apiKeyLimit: plan.apiKeyLimit,
      rateLimitPerMinute: plan.rateLimitPerMinute,
      roleDetection: plan.roleDetection,
      publicDetection: plan.publicDetection,
      customBlocklist: plan.customBlocklist,
      lemonSqueezyProductId: plan.lemonSqueezyProductId || "",
      lemonMonthlyVariantId: plan.lemonMonthlyVariantId || "",
      lemonYearlyVariantId: plan.lemonYearlyVariantId || "",
    });
  };

  const formFields = (isEdit: boolean) => (
    <div className="grid md:grid-cols-2 gap-8 pt-2">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 border-b pb-2">General & Pricing</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Plan Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Growth" className="h-9 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Slug {isEdit && <span className="text-slate-400">(read-only)</span>}</label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. growth" disabled={isEdit} className="h-9 rounded-lg text-sm font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Monthly Price ($)</label>
              <Input type="number" step="0.01" min="0" value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: Number(e.target.value) })} className="h-9 rounded-lg text-sm font-mono" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Yearly Price ($)</label>
              <Input type="number" step="0.01" min="0" value={form.yearlyPrice} onChange={(e) => setForm({ ...form, yearlyPrice: Number(e.target.value) })} className="h-9 rounded-lg text-sm font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">LS Product ID</label>
              <Input value={form.lemonSqueezyProductId || ""} onChange={(e) => setForm({ ...form, lemonSqueezyProductId: e.target.value })} placeholder="e.g. 12345" className="h-9 rounded-lg text-sm font-mono" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">LS Monthly Variant</label>
              <Input value={form.lemonMonthlyVariantId || ""} onChange={(e) => setForm({ ...form, lemonMonthlyVariantId: e.target.value })} placeholder="e.g. 54321" className="h-9 rounded-lg text-sm font-mono" />
            </div>
          </div>
        </div>

        {/* Limits */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 border-b pb-2">Resource Limits</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Monthly Quota (-1 for ∞)</label>
              <Input type="number" min="-1" value={form.quotaLimit} onChange={(e) => setForm({ ...form, quotaLimit: Number(e.target.value) })} className="h-9 rounded-lg text-sm font-mono" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Domain Limit (-1 for ∞)</label>
              <Input type="number" min="-1" value={form.domainLimit} onChange={(e) => setForm({ ...form, domainLimit: Number(e.target.value) })} className="h-9 rounded-lg text-sm font-mono" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">API Key Limit (-1 for ∞)</label>
              <Input type="number" min="-1" value={form.apiKeyLimit} onChange={(e) => setForm({ ...form, apiKeyLimit: Number(e.target.value) })} className="h-9 rounded-lg text-sm font-mono" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Rate Limit (req/min)</label>
              <Input type="number" min="-1" value={form.rateLimitPerMinute} onChange={(e) => setForm({ ...form, rateLimitPerMinute: Number(e.target.value) })} className="h-9 rounded-lg text-sm font-mono" />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 border-b pb-2">Enabled Features</h4>
          <div className="grid grid-cols-1 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
            {(["roleDetection", "publicDetection"] as const).map((key) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer select-none p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-[#FF7A00] focus:ring-[#FF7A00]" />
                <span className="text-xs font-semibold text-slate-700">{key === "roleDetection" ? "Role Detection Engine" : "Public Domain Detection"}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => { if (isEdit) { setEditingPlan(null); } else { setIsCreateOpen(false); } setForm(EMPTY_FORM); }} className="rounded-lg text-xs font-semibold">Cancel</Button>
          <Button
            onClick={isEdit ? handleUpdatePlan : handleCreatePlan}
            disabled={actionLoading === (isEdit ? "update" : "create")}
            className="bg-[#FF7A00] hover:bg-[#E56E00] text-white rounded-lg text-xs font-semibold"
          >
            {actionLoading === (isEdit ? "update" : "create") ? "Saving..." : isEdit ? "Save Changes" : "Create Plan"}
          </Button>
        </div>
      </div>

      {/* Live Preview Column */}
      <div className="hidden md:block">
        <h4 className="text-sm font-bold text-slate-800 mb-4 text-center">Live Preview</h4>
        <div className="bg-white rounded-2xl border border-[#FF7A00] ring-1 ring-[#FF7A00] p-6 shadow-lg max-w-[280px] mx-auto flex flex-col h-full">
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">{form.name || "Plan Name"}</h4>
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl font-black text-slate-900">${form.monthlyPrice || "0"}</span>
                <span className="text-[10px] text-slate-400 font-semibold">/mo</span>
              </div>
            </div>
            
            <div className="space-y-2 border-t border-slate-100 pt-4 text-[11px] font-medium text-slate-600">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#FF7A00] shrink-0 mt-0.5" />
                <span>{form.quotaLimit === -1 ? "Unlimited" : (form.quotaLimit ?? "Unavailable")} monthly validations</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#FF7A00] shrink-0 mt-0.5" />
                <span>{form.domainLimit === -1 ? "Unlimited" : (form.domainLimit ?? "Unavailable")} protected domains</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#FF7A00] shrink-0 mt-0.5" />
                <span>{form.apiKeyLimit === -1 ? "Unlimited" : (form.apiKeyLimit ?? "Unavailable")} API Keys</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#FF7A00] shrink-0 mt-0.5" />
                <span>{form.rateLimitPerMinute === -1 ? "Unlimited" : (form.rateLimitPerMinute ?? "Unavailable")} req/minute limit</span>
              </div>
              
              {form.roleDetection && (
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FF7A00] shrink-0 mt-0.5" />
                  <span>Role account detection</span>
                </div>
              )}
              {form.publicDetection && (
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FF7A00] shrink-0 mt-0.5" />
                  <span>Public provider detection</span>
                </div>
              )}
              {form.customBlocklist && (
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FF7A00] shrink-0 mt-0.5" />
                  <span>Custom blocklists allowed</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-6 mt-auto">
            <Button className="w-full bg-[#FF7A00] hover:bg-[#FF7A00] text-white rounded-xl text-xs font-bold pointer-events-none">
              Select Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 ml-auto">
          <Button onClick={() => { setForm(EMPTY_FORM); setIsCreateOpen(true); }} className="bg-[#FF7A00] hover:bg-[#E56E00] text-white rounded-xl text-xs font-semibold gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New Plan
          </Button>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog className="max-w-4xl" isOpen={isCreateOpen} onClose={() => { setIsCreateOpen(false); setForm(EMPTY_FORM); }} title="Create New Plan">
        {formFields(false)}
      </Dialog>

      {/* Edit Dialog */}
      <Dialog className="max-w-4xl" isOpen={editingPlan !== null} onClose={() => { setEditingPlan(null); setForm(EMPTY_FORM); }} title={`Edit Plan: ${editingPlan?.name ?? ""}`}>
        {formFields(true)}
      </Dialog>

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
          <p className="text-xs font-semibold">Loading plans...</p>
        </div>
      ) : plans.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Slug</th>
                <th className="px-6 py-3">Monthly</th>
                <th className="px-6 py-3">Quota</th>
                <th className="px-6 py-3">Domains</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {plans.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">{item.slug}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {item.monthlyPrice === 0 ? "Free" : `$${(item.monthlyPrice / 100).toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">
                    {item.quotaLimit === -1 ? "∞" : item.quotaLimit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">
                    {item.domainLimit === -1 ? "∞" : item.domainLimit}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border",
                      item.isActive
                        ? "bg-green-50 text-green-700 border-green-100"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    )}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button onClick={() => openEditDialog(item)} variant="outline" className="rounded-lg px-2 py-1 text-[10px] font-bold h-7 gap-1">
                        <Pencil className="w-3 h-3" /> Edit
                      </Button>
                      <Button
                        onClick={() => handleTogglePlan(item.id, item.isActive)}
                        disabled={actionLoading === item.id}
                        variant="outline"
                        className={cn(
                          "rounded-lg px-2 py-1 text-[10px] font-bold h-7 gap-1",
                          item.isActive ? "text-slate-600" : "text-green-700"
                        )}
                      >
                        {item.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        {actionLoading === item.id ? "..." : item.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-700 flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">No plans configured</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">Create your first pricing plan to get started.</p>
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
