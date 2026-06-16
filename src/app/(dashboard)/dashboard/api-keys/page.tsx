"use client";

import * as React from "react";
import { getUserDomainsAction } from "@/features/domains/actions";
import { 
  createApiKeyAction, 
  getDomainApiKeysAction, 
  toggleApiKeyAction, 
  deleteApiKeyAction 
} from "@/features/api-keys/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Power, 
  RotateCw,
  AlertTriangle,
  Globe
} from "lucide-react";

interface Domain {
  id: string;
  hostname: string;

}

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  type: "PUBLIC" | "SECRET";
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [domains, setDomains] = React.useState<Domain[]>([]);
  const [selectedDomainId, setSelectedDomainId] = React.useState<string>("");
  const [keys, setKeys] = React.useState<ApiKey[]>([]);
  
  const [loading, setLoading] = React.useState(true);
  const [keysLoading, setKeysLoading] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newKeyName, setNewKeyName] = React.useState("");
  const [newKeyType, setNewKeyType] = React.useState<"PUBLIC" | "SECRET">("PUBLIC");
  
  const [generatedKey, setGeneratedKey] = React.useState<string | null>(null);
  const [copiedKey, setCopiedKey] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const loadDomains = async () => {
    setLoading(true);
    const res = await getUserDomainsAction();
    if (res.success && res.data && res.data.length > 0) {
      setDomains(res.data as Domain[]);
      // Automatically select first verified domain or first domain
      const verified = (res.data as Domain[])[0]; // Just grab the first one instead of looking for isVerified
      const toSelect = verified ? verified.id : res.data[0].id;
      setSelectedDomainId(toSelect);
    }
    setLoading(false);
  };

  const loadKeys = async (domainId: string) => {
    if (!domainId) return;
    setKeysLoading(true);
    const res = await getDomainApiKeysAction(domainId);
    if (res.success && res.data) {
      setKeys(res.data as unknown as ApiKey[]);
    } else {
      setKeys([]);
    }
    setKeysLoading(false);
  };

  React.useEffect(() => {
    loadDomains();
  }, []);

  React.useEffect(() => {
    if (selectedDomainId) {
      loadKeys(selectedDomainId);
    } else {
      setKeys([]);
    }
  }, [selectedDomainId]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setGeneratedKey(null);
    setActionLoading("create");

    const res = await createApiKeyAction({
      domainId: selectedDomainId,
      name: newKeyName,
      type: newKeyType,
    });

    if (res.success && res.data) {
      setGeneratedKey(res.data.rawKey);
      setNewKeyName("");
      await loadKeys(selectedDomainId);
    } else {
      setErrorMsg(res.error || "Failed to generate API key.");
    }
    setActionLoading(null);
  };

  const handleToggleKey = async (keyId: string, currentActive: boolean) => {
    setActionLoading(keyId);
    const res = await toggleApiKeyAction({ keyId, isActive: !currentActive });
    if (res.success) {
      await loadKeys(selectedDomainId);
    }
    setActionLoading(null);
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke and delete this API key? This cannot be undone.")) return;
    setActionLoading(keyId);
    const res = await deleteApiKeyAction({ keyId });
    if (res.success) {
      await loadKeys(selectedDomainId);
    }
    setActionLoading(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const activeDomain = domains.find(d => d.id === selectedDomainId);

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">API Keys</h2>
          <p className="text-xs text-slate-500 font-medium">Generate keys to authorize validation requests from your website client or backend.</p>
        </div>
        
        {domains.length > 0 && (
          <div className="flex items-center gap-3">
            <select
              value={selectedDomainId}
              onChange={(e) => setSelectedDomainId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-[#FF7A00] transition-colors"
            >
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.hostname}
                </option>
              ))}
            </select>

            <Button 
              onClick={() => {
                setErrorMsg(null);
                setGeneratedKey(null);
                setIsCreateOpen(true);
              }}
              disabled={!activeDomain}
              className="bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" /> Generate Key
            </Button>
          </div>
        )}
      </div>

      {/* Main content check */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
          <RotateCw className="w-8 h-8 mx-auto animate-spin mb-4 text-[#FF7A00]" />
          <p className="text-xs font-semibold">Loading data...</p>
        </div>
      ) : domains.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-[#FF7A00] flex items-center justify-center mx-auto mb-4">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Add a domain first</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
            API keys must be bound to a specific domain hostname. Add your domain under the Domains page before generating keys.
          </p>
        </div>
      ) : (
        <>
          {keysLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
              <RotateCw className="w-6 h-6 mx-auto animate-spin mb-2 text-[#FF7A00]" />
              <p className="text-xs font-semibold">Loading API keys...</p>
            </div>
          ) : keys.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Key Name</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Key Prefix</th>
                    <th className="px-6 py-3">Last Used</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {keys.map((key) => (
                    <tr key={key.id} className="hover:bg-slate-50/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{key.name}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border",
                          key.type === "PUBLIC" 
                            ? "bg-sky-50 text-sky-700 border-sky-100" 
                            : "bg-purple-50 text-purple-700 border-purple-100"
                        )}>
                          {key.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500 font-semibold">{key.prefix}••••••••••••••••</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : "Never"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border",
                          key.isActive 
                            ? "bg-green-50 text-green-700 border-green-100" 
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        )}>
                          {key.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleKey(key.id, key.isActive)}
                            disabled={actionLoading === key.id}
                            className={cn(
                              "p-1.5 rounded-lg border transition-all",
                              key.isActive
                                ? "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                            )}
                            title={key.isActive ? "Deactivate Key" : "Activate Key"}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteKey(key.id)}
                            disabled={actionLoading === key.id}
                            className="p-1.5 border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-700 rounded-lg text-slate-400 transition-colors"
                            title="Revoke & Delete"
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
            <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-[#FF7A00] flex items-center justify-center mx-auto mb-4">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">No API keys created yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
                Generate an API key for your website domain to start capturing and validating email forms.
              </p>
              <Button 
                onClick={() => {
                  setErrorMsg(null);
                  setGeneratedKey(null);
                  setIsCreateOpen(true);
                }}
                disabled={!activeDomain}
                className="bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-xs font-bold gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create API Key
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Key Dialog */}
      <Dialog 
        isOpen={isCreateOpen} 
        onClose={() => {
          if (!generatedKey) {
            setIsCreateOpen(false);
          } else {
            alert("Please copy your API key and save it securely before closing.");
          }
        }} 
        title={generatedKey ? "Key Generated Successfully" : "Generate API Key"}
      >
        {generatedKey ? (
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl font-medium flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-0.5">Save this API key somewhere safe!</strong>
                For security reasons, this key will not be shown again. If you lose it, you will need to generate a new one.
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Your API Key</span>
              <div className="font-mono font-bold text-sm text-[#FF7A00] bg-slate-50 border border-slate-150 p-3.5 rounded-xl flex items-center justify-between gap-3 select-all">
                <span className="break-all">{generatedKey}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedKey)}
                  className="p-2 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 shrink-0 transition-colors"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3">
              <Button
                onClick={() => {
                  setGeneratedKey(null);
                  setIsCreateOpen(false);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                I have saved this key
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateKey} className="space-y-4 pt-2">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Key Name</label>
              <Input 
                placeholder="e.g. Production Contact Form" 
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Key Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewKeyType("PUBLIC")}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    newKeyType === "PUBLIC" 
                      ? "border-[#FF7A00] bg-orange-50/20 text-[#FF7A00] font-bold"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  )}
                >
                  <div className="text-xs">Public Key</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Used in client-side HTML/JS widgets.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setNewKeyType("SECRET")}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    newKeyType === "SECRET" 
                      ? "border-[#FF7A00] bg-orange-50/20 text-[#FF7A00] font-bold"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  )}
                >
                  <div className="text-xs">Secret Key</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Used in secure backend API endpoints.</div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={actionLoading === "create"}
                className="bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl text-xs font-bold"
              >
                {actionLoading === "create" ? "Generating..." : "Generate Key"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
export const dynamic = "force-dynamic";
