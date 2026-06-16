"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { HelpCircle } from "lucide-react";

export function DashboardHeader() {
  const pathname = usePathname();

  // Simple path to Title mapper
  const getPageDetails = () => {
    if (pathname.includes("/domains")) {
      return { title: "Domains", subtitle: "Register and verify your website domains." };
    }
    if (pathname.includes("/api-keys")) {
      return { title: "API Keys", subtitle: "Generate and manage keys to secure your forms." };
    }
    if (pathname.includes("/usage")) {
      return { title: "Usage Analytics", subtitle: "Monitor your validation volume and statistics." };
    }
    if (pathname.includes("/billing")) {
      return { title: "Billing & Plans", subtitle: "Manage subscription limits and billing details." };
    }
    if (pathname.includes("/settings")) {
      return { title: "Settings", subtitle: "Configure your personal and security options." };
    }
    return { title: "Overview", subtitle: "Real-time summary of your forms and validation status." };
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
          href="/docs"
          className="text-xs font-semibold text-slate-500 hover:text-slate-950 transition-colors flex items-center gap-1.5"
        >
          Documentation
        </Link>
        <span className="h-4 w-px bg-slate-200" />
        <Link
          href="/support"
          className="text-xs font-semibold text-slate-500 hover:text-slate-950 transition-colors flex items-center gap-1.5"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          Get Help
        </Link>
      </div>
    </header>
  );
}
