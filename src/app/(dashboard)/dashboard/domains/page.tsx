"use client";

import * as React from "react";
import { 
  addDomainAction, 
  deleteDomainAction, 
  toggleDomainAction, 
  getUserDomainsAction
} from "@/features/domains/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { 
  Globe, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Copy,
  Check,
  Power,
  RotateCw
} from "lucide-react";

interface Domain {
  id: string;
  hostname: string;
  isActive: boolean;
  createdAt: Date;
}

export default function DomainsPage() {
  const [domains, setDomains] = React.useState<Domain[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  
  const [newHostname, setNewHostname] = React.useState("");
  
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const loadDomains = async () => {
    setLoading(true);
    const res = await getUserDomainsAction();
    if (res.success && res.data) {
      // Parse dates safely
      interface DBDomain {
        id: string;
        hostname: string;
        isActive: boolean;
        createdAt: string | Date;
      }
      const parsed = (res.data as DBDomain[]).map((d) => ({
        ...d,
        createdAt: new Date(d.createdAt),
      }));
      setDomains(parsed);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadDomains();
  }, []);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading("add");

    const res = await addDomainAction({ hostname: newHostname });
    if (res.success) {
      setNewHostname("");
      setIsAddOpen(false);
      setSuccessMsg("Domain added successfully.");
      await loadDomains();
    } else {
      setErrorMsg(res.error || "Failed to add domain.");
    }
    setActionLoading(null);
  };

  const handleToggleDomain = async (domainId: string, currentActive: boolean) => {
    setActionLoading(domainId);
    const res = await toggleDomainAction({ domainId, isActive: !currentActive });
    if (res.success) {
      await loadDomains();
    }
    setActionLoading(null);
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm("Are you sure you want to delete this domain and all associated API keys?")) return;
    setActionLoading(domainId);
    const res = await deleteDomainAction({ domainId });
    if (res.success) {
      await loadDomains();
    }
    setActionLoading(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Protected Domains</h2>
          <p className="text-xs text-slate-500 font-medium">Whitelist and authorize origins for forms validation.</p>
        </div>
        <Button 
          onClick={() => {
            setErrorMsg(null);
            setIsAddOpen(true);
          }}
          className="bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Domain
        </Button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
          <RotateCw className="w-8 h-8 mx-auto animate-spin mb-4 text-[#FF7A00]" />
          <p className="text-xs font-semibold">Loading domains...</p>
        </div>
      ) : domains.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Hostname</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Added On</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {domains.map((domain) => (
                <tr key={domain.id} className="hover:bg-slate-50/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-slate-900">{domain.hostname}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 font-bold text-[10px] uppercase">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                      {!domain.isActive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold text-[10px] uppercase">
                          Disabled
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{domain.createdAt.toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleDomain(domain.id, domain.isActive)}
                        disabled={actionLoading === domain.id}
                        className={cn(
                          "p-1.5 rounded-lg border transition-all",
                          domain.isActive
                            ? "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                        )}
                        title={domain.isActive ? "Disable Protection" : "Enable Protection"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDomain(domain.id)}
                        disabled={actionLoading === domain.id}
                        className="p-1.5 border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-700 rounded-lg text-slate-400 transition-colors"
                        title="Delete Domain"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-[#FF7A00] flex items-center justify-center mx-auto mb-4">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">No domains added yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
            Add your website domain hostname to whitelist it for form submission protection.
          </p>
          <Button 
            onClick={() => {
              setErrorMsg(null);
              setIsAddOpen(true);
            }}
            className="bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-xs font-bold gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add your first domain
          </Button>
        </div>
      )}

      {/* Add Domain Dialog */}
      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Domain">
        <form onSubmit={handleAddDomain} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Website Hostname</label>
            <Input 
              placeholder="e.g. yourcompany.com" 
              value={newHostname}
              onChange={(e) => setNewHostname(e.target.value)}
              required
            />
            <p className="text-[10px] text-slate-400 font-medium">Do not include https:// or trailing slashes.</p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              className="rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={actionLoading === "add"}
              className="bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-xs font-bold"
            >
              {actionLoading === "add" ? "Adding..." : "Add Domain"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
export const dynamic = "force-dynamic";
