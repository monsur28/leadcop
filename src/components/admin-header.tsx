"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { HelpCircle, Menu, X, LayoutDashboard, Users, Package, CreditCard, Globe, ArrowUpCircle, FileText, FileEdit, Mail, Settings, ShieldCheck } from "lucide-react";

export function AdminHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    if (pathname.includes("/admin/websites")) {
      return { title: "System Websites", subtitle: "Audit added origins." };
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

  const adminNavItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Plans", href: "/admin/plans", icon: Package },
    { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
    { name: "Websites", href: "/admin/websites", icon: Globe },
    { name: "Upgrade Requests", href: "/admin/upgrade-requests", icon: ArrowUpCircle },
    { name: "Blog Posts", href: "/admin/blog", icon: FileText },
    { name: "CMS Pages", href: "/admin/cms", icon: FileEdit },
    { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
    { name: "Support Tickets", href: "/admin/support", icon: HelpCircle },
    { name: "Admin Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      <header className="h-16 px-4 md:px-8 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm md:text-base font-bold text-slate-900">{title}</h1>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium hidden sm:block">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-slate-950 transition-colors flex items-center gap-1.5 hidden sm:flex"
          >
            User Dashboard
          </Link>
          <span className="h-4 w-px bg-slate-200 hidden sm:block" />
          <Link
            href="/admin/support"
            className="text-xs font-semibold text-slate-500 hover:text-slate-950 transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            Queue
          </Link>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#081225] text-slate-300 md:hidden flex flex-col overflow-hidden h-screen">
          <div className="h-16 px-4 border-b border-[#0F172A] flex items-center justify-between shrink-0">
            <Link href="/admin" className="flex items-center gap-2.5 group" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#FF7A00] to-[#E66900] text-white shadow-sm">
                <ShieldCheck className="h-4.5 w-4.5 stroke-[2.5]" />
              </div>
              <span className="font-bold tracking-tight text-white">
                LeadCop <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-[#FF9D3D] uppercase tracking-normal ml-1 font-extrabold">Admin</span>
              </span>
            </Link>
            <button 
              className="p-2 text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                    ${isActive
                      ? "bg-[#FF7A00] text-white shadow-md shadow-[#FF7A00]/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-500"}`} />
                  {item.name}
                </Link>
              );
            })}
            
            <div className="pt-4 mt-4 border-t border-[#0F172A]">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <LayoutDashboard className="h-5 w-5 text-slate-500" />
                User Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
