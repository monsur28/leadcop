"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { HelpCircle, Menu, X, FileText } from "lucide-react";
import { DashboardSidebar } from "./dashboard-sidebar";

interface SidebarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  globalRole?: string | null;
}

interface HeaderProps {
  user: SidebarUser;
}

interface PageDetails {
  title: string;
  subtitle: string;
}

const PAGE_MAP: Record<string, PageDetails> = {
  "/websites": { title: "Websites", subtitle: "Register and manage your protected domains." },
  "/usage": { title: "Usage Analytics", subtitle: "Monitor your validation volume and statistics." },
  "/billing": { title: "Billing & Plans", subtitle: "Manage your subscription and billing details." },
  "/settings": { title: "Settings", subtitle: "Configure your personal and security options." },
};

function getPageDetails(pathname: string): PageDetails {
  for (const [segment, details] of Object.entries(PAGE_MAP)) {
    if (pathname.includes(segment)) return details;
  }
  return { title: "Overview", subtitle: "Real-time summary of your validation status." };
}

export function DashboardHeader({ user }: HeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const { title, subtitle } = getPageDetails(pathname);

  return (
    <>
      <header className="h-16 px-4 md:px-8 border-b border-border bg-card flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-foreground">{title}</h1>
            <p className="text-[11px] text-muted-foreground font-medium truncate max-w-[160px] sm:max-w-xs">
              {subtitle}
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <Link
            href="/docs"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Docs
          </Link>
          <span className="hidden sm:block h-4 w-px bg-border mx-1" />
          <Link
            href="/support"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Get Help</span>
          </Link>
        </nav>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full shadow-xl animate-in slide-in-from-left-full duration-300">
            <div className="absolute top-4 -right-12">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 text-white focus:outline-none focus:ring-2 focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <DashboardSidebar
              user={user}
              className="flex w-full h-full"
              onItemClick={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}