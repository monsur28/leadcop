"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { HelpCircle } from "lucide-react";

export function AdminHeader() {
  const pathname = usePathname();

  const getPageDetails = () => {
    if (pathname.includes("/admin/users")) {
      return { title: "Manage Users", subtitle: "View registered users and roles." };
    }
    if (pathname.includes("/admin/plans")) {
      return { title: "Configure Plans", subtitle: "Set features, limits, and pricing tiers." };
    }
    if (pathname.includes("/admin/subscriptions")) {
      return { title: "User Subscriptions", subtitle: "Inspect status, quotas, and expiration details." };
    }
    if (pathname.includes("/admin/domains")) {
      return { title: "System Domains", subtitle: "Audit added origins and verification states." };
    }
    if (pathname.includes("/admin/api-keys")) {
      return { title: "API Keys Audit", subtitle: "Audit active, inactive, and deleted public/secret tokens." };
    }
    if (pathname.includes("/admin/upgrade-requests")) {
      return { title: "Upgrade Requests", subtitle: "Review and approve pending tier upgrades." };
    }
    if (pathname.includes("/admin/blog")) {
      return { title: "Marketing Blog", subtitle: "Compose, edit, and publish article updates." };
    }
    if (pathname.includes("/admin/cms")) {
      return { title: "CMS Pages", subtitle: "Manage system terms, privacy, and pages." };
    }
    if (pathname.includes("/admin/newsletter")) {
      return { title: "Newsletter Subscribers", subtitle: "View mailing list audience and status." };
    }
    if (pathname.includes("/admin/support")) {
      return { title: "Support Tickets", subtitle: "Reply and resolve client inquiries." };
    }
    if (pathname.includes("/admin/settings")) {
      return { title: "Admin Settings", subtitle: "Manage core configurations." };
    }
    return { title: "Admin Console", subtitle: "Overview of system registrations, upgrades, and volumes." };
  };

  const { title, subtitle } = getPageDetails();

  return (
    <header className="h-16 px-8 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-base font-bold text-slate-900">{title}</h1>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-slate-500 hover:text-slate-950 transition-colors flex items-center gap-1.5"
        >
          User Dashboard
        </Link>
        <span className="h-4 w-px bg-slate-200" />
        <Link
          href="/admin/support"
          className="text-xs font-semibold text-slate-500 hover:text-slate-950 transition-colors flex items-center gap-1.5"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          Queue
        </Link>
      </div>
    </header>
  );
}
