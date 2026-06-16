"use client";

import * as React from "react";
import {
  getAdminCmsPagesAction,
  createCmsPageAction,
  updateCmsPageAction,
  deleteCmsPageAction,
  toggleCmsPageAction,
} from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { RotateCw, FileText, Plus, Pencil, Trash2, AlertCircle, Check, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface CmsPageItem {
  id: string;
  slug: string;
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const EMPTY_FORM = {
  title: "",
  slug: "",
  seoTitle: "",
  seoDescription: "",
  content: "",
  published: false,
};

export default function AdminCmsPage() {
  const [pages, setPages] = React.useState<CmsPageItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingPage, setEditingPage] = React.useState<CmsPageItem | null>(null);
  const [form, setForm] = React.useState(EMPTY_FORM);

  const loadPages = async () => {
    setLoading(true);
    const res = await getAdminCmsPagesAction();
    if (res.success && res.data) {
      setPages(res.data as unknown as CmsPageItem[]);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadPages();
  }, []);

  const handleCreate = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading("create");

    const res = await createCmsPageAction({
      ...form,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
    });

    if (res.success) {
      setSuccessMsg("CMS page created successfully!");
      setIsCreateOpen(false);
      setForm(EMPTY_FORM);
      await loadPages();
    } else {
      setErrorMsg(res.error || "Failed to create page.");
    }
    setActionLoading(null);
  };

  const handleUpdate = async () => {
    if (!editingPage) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading("update");

    const res = await updateCmsPageAction({
      id: editingPage.id,
      ...form,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
    });

    if (res.success) {
      setSuccessMsg("CMS page updated successfully!");
      setEditingPage(null);
      setForm(EMPTY_FORM);
      await loadPages();
    } else {
      setErrorMsg(res.error || "Failed to update page.");
    }
    setActionLoading(null);
  };

  const handleDelete = async (pageId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading(pageId);

    const res = await deleteCmsPageAction({ id: pageId });
    if (res.success) {
      setSuccessMsg("CMS page deleted!");
      await loadPages();
    } else {
      setErrorMsg(res.error || "Failed to delete page.");
    }
    setActionLoading(null);
  };

  const handleTogglePublished = async (pageId: string, currentPublished: boolean) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading(`toggle-${pageId}`);

    const res = await toggleCmsPageAction({ id: pageId, published: !currentPublished });
    if (res.success) {
      setSuccessMsg(`Page ${!currentPublished ? "published" : "unpublished"} successfully!`);
      await loadPages();
    } else {
      setErrorMsg(res.error || "Failed to toggle status.");
    }
    setActionLoading(null);
  };

  const openEditDialog = (page: CmsPageItem) => {
    setEditingPage(page);
    setForm({
      title: page.title,
      slug: page.slug,
      seoTitle: page.seoTitle ?? "",
      seoDescription: page.seoDescription ?? "",
      content: page.content,
      published: page.published,
    });
  };

  const renderFormFields = (isEdit: boolean) => (
    <div className="space-y-4 pt-2 max-h-[60vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">Page Title</label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Terms of Service" className="h-9 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">Slug</label>
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="terms-of-service" className="h-9 rounded-lg text-sm font-mono" />
        </div>
      </div>
      <div>
        <label className="text-[11px] font-bold text-slate-600 block mb-1">Content</label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="Write your page content here..."
          rows={10}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] resize-y"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">SEO Title</label>
          <Input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} placeholder="SEO title override" className="h-9 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">SEO Description</label>
          <Input value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} placeholder="Meta description" className="h-9 rounded-lg text-sm" />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-[#FF7A00] focus:ring-[#FF7A00]" />
        <span className="text-xs font-semibold text-slate-700">Publish immediately</span>
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={() => { if (isEdit) { setEditingPage(null); } else { setIsCreateOpen(false); } setForm(EMPTY_FORM); }} className="rounded-lg text-xs font-semibold">Cancel</Button>
        <Button
          onClick={isEdit ? handleUpdate : handleCreate}
          disabled={actionLoading === (isEdit ? "update" : "create")}
          className="bg-[#FF7A00] hover:bg-[#E56E00] text-white rounded-lg text-xs font-semibold"
        >
          {actionLoading === (isEdit ? "update" : "create") ? "Saving..." : isEdit ? "Save Changes" : "Create Page"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">CMS Pages</h2>
          <p className="text-xs text-slate-500 font-medium">Manage legal documents, static pages, and landing text blocks.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadPages} variant="outline" className="rounded-xl text-xs font-semibold gap-1.5">
            <RotateCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button onClick={() => { setForm(EMPTY_FORM); setIsCreateOpen(true); }} className="bg-[#FF7A00] hover:bg-[#E56E00] text-white rounded-xl text-xs font-semibold gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New Page
          </Button>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog isOpen={isCreateOpen} onClose={() => { setIsCreateOpen(false); setForm(EMPTY_FORM); }} title="Create CMS Page">
        {renderFormFields(false)}
      </Dialog>

      {/* Edit Dialog */}
      <Dialog isOpen={editingPage !== null} onClose={() => { setEditingPage(null); setForm(EMPTY_FORM); }} title={`Edit Page: ${editingPage?.title ?? ""}`}>
        {renderFormFields(true)}
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
          <p className="text-xs font-semibold">Loading CMS pages...</p>
        </div>
      ) : pages.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Slug</th>
                <th className="px-6 py-3">Author</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Updated</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {pages.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 max-w-[200px] truncate">{item.title}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">/{item.slug}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{item.author?.name ?? "Unknown"}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border",
                      item.published
                        ? "bg-green-50 text-green-700 border-green-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    )}>
                      {item.published ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                      {item.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button onClick={() => openEditDialog(item)} variant="outline" className="rounded-lg px-2 py-1 text-[10px] font-bold h-7 gap-1">
                        <Pencil className="w-3 h-3" /> Edit
                      </Button>
                      <Button
                        onClick={() => handleTogglePublished(item.id, item.published)}
                        disabled={actionLoading === `toggle-${item.id}`}
                        variant="outline"
                        className={cn(
                          "rounded-lg px-2 py-1 text-[10px] font-bold h-7 gap-1",
                          item.published ? "text-amber-700" : "text-green-700"
                        )}
                      >
                        {item.published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {item.published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        onClick={() => handleDelete(item.id)}
                        disabled={actionLoading === item.id}
                        variant="outline"
                        className="rounded-lg px-2 py-1 text-[10px] font-bold h-7 gap-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                      >
                        <Trash2 className="w-3 h-3" />
                        {actionLoading === item.id ? "..." : "Delete"}
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
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">No CMS pages yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">Create your first static page (Terms of Service, Privacy Policy, etc.).</p>
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
