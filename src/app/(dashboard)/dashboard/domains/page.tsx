"use client";

import * as React from "react";
import { 
  addDomainAction, 
  deleteDomainAction, 
  toggleDomainAction, 
  verifyDomainAction,
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
  isVerified: boolean;
  verificationToken: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
}

export default function DomainsPage() {
  const [domains, setDomains] = React.useState<Domain[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = React.useState(false);
  
  const [newHostname, setNewHostname] = React.useState("");
  const [selectedDomain, setSelectedDomain] = React.useState<Domain | null>(null);
  const [copiedToken, setCopiedToken] = React.useState(false);
  
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
        isVerified: boolean;
        verificationToken: string | null;
        verifiedAt: string | Date | null;
        createdAt: string | Date;
      }
      const parsed = (res.data as DBDomain[]).map((d) => ({
        ...d,
        createdAt: new Date(d.createdAt),
        verifiedAt: d.verifiedAt ? new Date(d.verifiedAt) : null,
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
      setSuccessMsg("Domain added successfully. Please verify ownership.");
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

  const handleVerifyDomain = async (domainId: string) => {
    setActionLoading("verify");
    setErrorMsg(null);
    const res = await verifyDomainAction({ domainId });
    if (res.success) {
      setSuccessMsg("Domain verified successfully!");
      setIsVerifyOpen(false);
      await loadDomains();
    } else {
      setErrorMsg(res.error || "Verification failed. Please check your DNS or meta tag settings.");
    }
    setActionLoading(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
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
                      {domain.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 font-bold text-[10px] uppercase">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedDomain(domain);
                            setErrorMsg(null);
                            setSuccessMsg(null);
                            setIsVerifyOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100/50 font-bold text-[10px] uppercase transition-colors"
                        >
                          <Clock className="w-3 h-3 animate-pulse" /> Verify
                        </button>
                      )}
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
            Add and verify your website domain hostname to whitelist it for form submission protection.
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

      {/* Verification Instructions Dialog */}
      <Dialog 
        isOpen={isVerifyOpen} 
        onClose={() => setIsVerifyOpen(false)} 
        title={`Verify ${selectedDomain?.hostname || "Domain"}`}
      >
        {selectedDomain && (
          <div className="space-y-5 pt-2 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Add either the DNS TXT record or the HTML meta tag to verify that you own this website domain.
            </p>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Method 1: DNS TXT Verification</h4>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-slate-500">Record Type</span>
                  <span className="col-span-2 font-mono font-bold text-slate-900">TXT</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-slate-500">Host / Alias</span>
                  <span className="col-span-2 font-mono font-bold text-slate-900">@</span>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="font-semibold text-slate-500">Value</span>
                  <span className="col-span-2 font-mono font-bold text-slate-900 flex items-center justify-between gap-2 bg-white p-1.5 border border-slate-200 rounded-lg">
                    <span className="truncate">leadcop-verification={selectedDomain.verificationToken}</span>
                    <button 
                      onClick={() => copyToClipboard(`leadcop-verification=${selectedDomain.verificationToken}`)}
                      className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-600"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Method 2: HTML Meta Tag Verification</h4>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-2">
                <p className="text-slate-500 leading-relaxed mb-1">Add this meta tag inside your homepage index.html &lt;head&gt; tag:</p>
                <div className="font-mono font-bold text-slate-900 flex items-center justify-between gap-2 bg-white p-1.5 border border-slate-200 rounded-lg">
                  <span className="truncate">{`<meta name="leadcop-verification" content="${selectedDomain.verificationToken}" />`}</span>
                  <button 
                    onClick={() => copyToClipboard(`<meta name="leadcop-verification" content="${selectedDomain.verificationToken}" />`)}
                    className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-600"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsVerifyOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Close
              </Button>
              <Button
                onClick={() => handleVerifyDomain(selectedDomain.id)}
                disabled={actionLoading === "verify"}
                className="bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-xs font-bold"
              >
                {actionLoading === "verify" ? "Verifying..." : "Verify Domain"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
export const dynamic = "force-dynamic";
