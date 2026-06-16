"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { HelpCircle, Menu, X } from "lucide-react";
import { DashboardSidebar } from "./dashboard-sidebar";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function DashboardHeader({ user }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
    <>
      <header className="h-16 px-4 md:px-8 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 focus:outline-none"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900">{title}</h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate max-w-[150px] sm:max-w-xs">{subtitle}</p>
          </div>
        </div>

      <div className="flex items-center gap-4">
        <Link
          href="/docs"
          className="hidden sm:flex text-xs font-semibold text-slate-500 hover:text-slate-950 transition-colors items-center gap-1.5"
        >
          Documentation
        </Link>
        <span className="hidden sm:block h-4 w-px bg-slate-200" />
        <Link
          href="/support"
          className="text-xs font-semibold text-slate-500 hover:text-slate-950 transition-colors flex items-center gap-1.5"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline">Get Help</span>
        </Link>
      </div>
    </header>

    {/* Mobile Sidebar Overlay */}
    {mobileMenuOpen && (
      <div className="fixed inset-0 z-50 md:hidden flex">
        {/* Dark overlay backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
        {/* Sliding Drawer */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl animate-in slide-in-from-left-full duration-300">
          <div className="absolute top-0 right-0 -mr-12 pt-4">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-slate-900/20 text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <DashboardSidebar 
            user={user} 
            className="flex w-full h-full" 
            onItemClick={() => setMobileMenuOpen(false)} 
          />
        </div>
      </div>
    )}
    </>
  );
}
