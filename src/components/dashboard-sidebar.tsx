"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Globe,
  BarChart3,
  CreditCard,
  Settings,
  HelpCircle,
  BookOpen,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface SidebarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  globalRole?: string | null;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  user: SidebarUser;
  className?: string;
  onItemClick?: () => void;
}

const PRIMARY_NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Websites", href: "/dashboard/websites", icon: Globe },
  { name: "Usage", href: "/dashboard/usage", icon: BarChart3 },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const SECONDARY_NAV: NavItem[] = [
  { name: "Support", href: "/support", icon: HelpCircle },
  { name: "Documentation", href: "/docs", icon: BookOpen },
];

const ADMIN_NAV_ITEM: NavItem = { name: "Admin Panel", href: "/admin", icon: ShieldCheck };

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150",
        isActive
          ? "bg-[color:var(--sidebar-active-bg)] text-[color:var(--sidebar-active-text)]"
          : "text-[color:var(--sidebar-text)] hover:bg-muted hover:text-[color:var(--sidebar-text-hover)]"
      )}
    >
      <item.icon
        className={cn(
          "w-4 h-4 shrink-0 transition-colors",
          isActive
            ? "text-[color:var(--sidebar-active-text)]"
            : "text-[color:var(--muted-foreground)]"
        )}
      />
      {item.name}
      {isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[color:var(--sidebar-active-text)]" />
      )}
    </Link>
  );
}

export function DashboardSidebar({ user, className, onItemClick }: SidebarProps) {
  const pathname = usePathname();

  const secondaryItems: NavItem[] =
    user.globalRole === "ADMIN" ? [ADMIN_NAV_ITEM, ...SECONDARY_NAV] : SECONDARY_NAV;

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const userInitial = user.name?.[0] ?? user.email?.[0] ?? "U";

  return (
    <aside
      className={cn(
        "w-64 flex-col h-screen shrink-0 border-r",
        "bg-[color:var(--sidebar-bg)] border-[color:var(--sidebar-border)]",
        className ?? "hidden md:flex sticky top-0"
      )}
    >
      {/* Logo */}
      <div className="h-16 px-5 border-b border-[color:var(--sidebar-border)] flex items-center">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[color:var(--primary-light)] text-primary-foreground shadow-sm shadow-[color:var(--primary-glow)]">
            <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
          </div>
          <span className="font-black tracking-tight text-foreground text-[15px]">
            Lead<span className="text-primary">Cop</span>
          </span>
        </Link>
      </div>

      {/* Primary Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          Main
        </p>
        {PRIMARY_NAV.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
            onClick={onItemClick}
          />
        ))}

        <div className="pt-4 pb-1">
          <div className="h-px bg-border" />
          <p className="px-3 pt-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Resources
          </p>
        </div>

        {secondaryItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
            onClick={onItemClick}
          />
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-[color:var(--sidebar-border)]">
        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted transition-colors group">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "User avatar"}
              width={32}
              height={32}
              className="rounded-full border border-border shrink-0"
              unoptimized
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[color:var(--primary-ghost)] border border-primary/20 flex items-center justify-center font-bold text-xs text-primary uppercase shrink-0">
              {userInitial}
            </div>
          )}
          <div className="flex-1 overflow-hidden leading-tight">
            <p className="text-sm font-bold text-foreground truncate">{user.name ?? "User"}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors shrink-0"
            title="Sign Out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}