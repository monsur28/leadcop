"use client";

import * as React from "react";
import { getAdminSystemStatsAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import {
  RotateCw,
  Users,
  Package,
  Globe,
  Key,
  PenTool,
  FileText,
  Mail,
  Activity,
  Server,
  Shield,
  Database,
} from "lucide-react";
import Link from "next/link";

interface SystemStats {
  totalUsers: number;
  totalPlans: number;
  activePlans: number;
  totalDomains: number;
  verifiedDomains: number;
  totalApiKeys: number;
  activeApiKeys: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
  totalCmsPages: number;
  publishedCmsPages: number;
  totalNewsletterSubscribers: number;
  totalValidationLogs: number;
}

interface StatCard {
  icon: React.ElementType;
  label: string;
  value: number;
  secondaryLabel?: string;
  secondaryValue?: number;
  color: string;
  bgColor: string;
  borderColor: string;
  href?: string;
}

export default function AdminSettingsPage() {
  const [stats, setStats] = React.useState<SystemStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  const loadStats = async () => {
    setLoading(true);
    const res = await getAdminSystemStatsAction();
    if (res.success && res.data) {
      setStats(res.data as SystemStats);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  const statCards: StatCard[] = stats
    ? [
        {
          icon: Users,
          label: "Total Users",
          value: stats.totalUsers,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-100",
          href: "/admin/users",
        },
        {
          icon: Package,
          label: "Plans",
          value: stats.totalPlans,
          secondaryLabel: "Active",
          secondaryValue: stats.activePlans,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-100",
          href: "/admin/plans",
        },
        {
          icon: Globe,
          label: "Domains",
          value: stats.totalDomains,
          secondaryLabel: "Verified",
          secondaryValue: stats.verifiedDomains,
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-100",
          href: "/admin/domains",
        },
        {
          icon: Key,
          label: "API Keys",
          value: stats.totalApiKeys,
          secondaryLabel: "Active",
          secondaryValue: stats.activeApiKeys,
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-100",
          href: "/admin/api-keys",
        },
        {
          icon: PenTool,
          label: "Blog Posts",
          value: stats.totalBlogPosts,
          secondaryLabel: "Published",
          secondaryValue: stats.publishedBlogPosts,
          color: "text-rose-600",
          bgColor: "bg-rose-50",
          borderColor: "border-rose-100",
          href: "/admin/blog",
        },
        {
          icon: FileText,
          label: "CMS Pages",
          value: stats.totalCmsPages,
          secondaryLabel: "Published",
          secondaryValue: stats.publishedCmsPages,
          color: "text-indigo-600",
          bgColor: "bg-indigo-50",
          borderColor: "border-indigo-100",
          href: "/admin/cms",
        },
        {
          icon: Mail,
          label: "Newsletter Subscribers",
          value: stats.totalNewsletterSubscribers,
          color: "text-teal-600",
          bgColor: "bg-teal-50",
          borderColor: "border-teal-100",
          href: "/admin/newsletter",
        },
        {
          icon: Activity,
          label: "Total Validations",
          value: stats.totalValidationLogs,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-100",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Admin Settings</h2>
          <p className="text-xs text-slate-500 font-medium">System overview, environment info, and quick navigation to admin modules.</p>
        </div>
        <Button onClick={loadStats} variant="outline" className="rounded-xl text-xs font-semibold gap-1.5">
          <RotateCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* System Stats Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
          <RotateCw className="w-8 h-8 mx-auto animate-spin mb-4 text-[#FF7A00]" />
          <p className="text-xs font-semibold">Loading system stats...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((card) => {
            const content = (
              <div
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-xl ${card.bgColor} ${card.color} flex items-center justify-center shrink-0 border ${card.borderColor}`}>
                    <card.icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-slate-900 tabular-nums">{card.value.toLocaleString()}</span>
                  {card.secondaryLabel && card.secondaryValue !== undefined && (
                    <span className="text-[11px] font-semibold text-slate-400">
                      {card.secondaryValue} {card.secondaryLabel}
                    </span>
                  )}
                </div>
              </div>
            );

            return card.href ? (
              <Link key={card.label} href={card.href} className="block">
                {content}
              </Link>
            ) : (
              <div key={card.label}>{content}</div>
            );
          })}
        </div>
      )}

      {/* Environment Info */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-500" />
            Environment Information
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">Runtime configuration and deployment details.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { label: "Runtime", value: `Node.js ${typeof process !== "undefined" ? process.version : "N/A"}` },
            { label: "Framework", value: "Next.js 15" },
            { label: "Database", value: "PostgreSQL (Prisma ORM)" },
            { label: "Authentication", value: "Auth.js v5" },
            { label: "Environment", value: process.env.NODE_ENV ?? "development" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between px-6 py-3">
              <span className="text-xs font-bold text-slate-600">{row.label}</span>
              <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-100">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Admin Links */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-500" />
            Quick Actions
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">Jump to frequently used admin modules.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-slate-100">
          {[
            { label: "Manage Users", href: "/admin/users", icon: Users },
            { label: "Manage Plans", href: "/admin/plans", icon: Package },
            { label: "Upgrade Requests", href: "/admin/upgrade-requests", icon: Activity },
            { label: "View Domains", href: "/admin/domains", icon: Globe },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex flex-col items-center justify-center py-5 gap-2 hover:bg-slate-50/50 transition-colors group"
            >
              <link.icon className="w-5 h-5 text-slate-400 group-hover:text-[#FF7A00] transition-colors" />
              <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Database Info */}
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-0.5">Database Management</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-lg">
              Direct database management (migrations, seeding, backups) should be performed through the Prisma CLI and your hosting provider&apos;s dashboard.
              Run <code className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded">npx prisma studio</code> locally for visual database browsing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
