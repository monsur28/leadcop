"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Globe, 
  Key, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ShieldCheck,
  Users,
  Package,
  Layers,
  ArrowUpCircle,
  FileText,
  Mail,
  PenTool
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AdminSidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const adminNavItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Plans", href: "/admin/plans", icon: Package },
    { name: "Subscriptions", href: "/admin/subscriptions", icon: Layers },
    { name: "Domains", href: "/admin/domains", icon: Globe },
    { name: "API Keys", href: "/admin/api-keys", icon: Key },
    { name: "Upgrade Requests", href: "/admin/upgrade-requests", icon: ArrowUpCircle },
    { name: "Blog Posts", href: "/admin/blog", icon: PenTool },
    { name: "CMS Pages", href: "/admin/cms", icon: FileText },
    { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
    { name: "Support Tickets", href: "/admin/support", icon: HelpCircle },
    { name: "Admin Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0">
      {/* Branding */}
      <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-sm">
            <ShieldCheck className="h-4.5 w-4.5 stroke-[2.5] text-[#FF7A00]" />
          </div>
          <span className="font-bold tracking-tight text-slate-900">
            LeadCop <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-normal ml-1 font-extrabold">Admin</span>
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all",
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-4.5 h-4.5 shrink-0", isActive ? "text-[#FF7A00]" : "text-slate-400")} />
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
              {user.name ? user.name[0] : user.email ? user.email[0] : "A"}
            </div>
          )}
          <div className="overflow-hidden leading-tight">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {user.name || "Admin"}
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
