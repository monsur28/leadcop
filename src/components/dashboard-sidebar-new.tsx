"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Globe, 
  Key, 
  BarChart3, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  BookOpen, 
  LogOut, 
  ShieldCheck,
  UserMinus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    globalRole?: string | null;
  };
  className?: string;
  onItemClick?: () => void;
}

export function DashboardSidebar({ user, className, onItemClick }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Websites", href: "/dashboard/websites", icon: Globe },
    { name: "Usage", href: "/dashboard/usage", icon: BarChart3 },
    { name: "Role Detection", href: "/dashboard/role-detection", icon: UserMinus },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const secondaryItems = [
    { name: "Support", href: "/support", icon: HelpCircle },
    { name: "Documentation", href: "/docs", icon: BookOpen },
  ];

  if ((user as any).globalRole === "ADMIN") {
    secondaryItems.unshift({ name: "Admin Panel", href: "/admin", icon: ShieldCheck });
  }

  return (
    <aside className={cn(
      "w-64 border-r border-slate-200 bg-white flex-col h-screen shrink-0",
      className || "hidden md:flex sticky top-0"
    )}>
      {/* Branding */}
      <div className="h-16 px-6 border-b border-slate-100 flex items-center">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#FF7A00] to-[#FF9F43] text-white shadow-sm shadow-orange-500/10">
            <ShieldCheck className="h-4.5 w-4.5 stroke-[2.5]" />
          </div>
          <span className="font-bold tracking-tight text-slate-900">
            LeadCop
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all",
                isActive
                  ? "bg-orange-50 text-[#FF7A00]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
              onClick={onItemClick}
            >
              <item.icon className={cn("w-4.5 h-4.5 shrink-0", isActive ? "text-[#FF7A00]" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}

        <div className="py-2">
          <div className="h-px bg-slate-100 my-2" />
        </div>

        {secondaryItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all",
                isActive
                  ? "bg-orange-50 text-[#FF7A00]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
              onClick={onItemClick}
            >
              <item.icon className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {user.image ? (
            <Image src={user.image} alt="User Avatar" width={32} height={32} className="rounded-full border border-slate-200" unoptimized />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 border border-slate-200 uppercase">
              {user.name ? user.name[0] : user.email ? user.email[0] : "U"}
            </div>
          )}
          <div className="overflow-hidden leading-tight">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {user.name || "User"}
            </h4>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors shrink-0"
          title="Sign Out"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>
    </aside>
  );
}
