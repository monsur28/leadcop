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
    { name: "Websites", href: "/admin/websites", icon: Globe },
    { name: "Upgrade Requests", href: "/admin/upgrade-requests", icon: ArrowUpCircle },
    { name: "Blog Posts", href: "/admin/blog", icon: PenTool },
    { name: "CMS Pages", href: "/admin/cms", icon: FileText },
    { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
    { name: "Support Tickets", href: "/admin/support", icon: HelpCircle },
    { name: "Admin Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-[#0F172A] bg-[#081225] flex-col h-screen sticky top-0 text-slate-300 hidden md:flex shrink-0">
      {/* Branding */}
      <div className="h-16 px-6 border-b border-[#0F172A] flex items-center justify-between shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-primary-dark text-white shadow-sm">
            <ShieldCheck className="h-4.5 w-4.5 stroke-[2.5]" />
          </div>
          <span className="font-bold tracking-tight text-white">
            LeadCop <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-primary-light uppercase tracking-normal ml-1 font-extrabold">Admin</span>
          </span>
        </Link>
      </div>

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
                  ? "bg-primary text-white shadow-[0_0_15px_rgba(255,122,0,0.3)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-4.5 h-4.5 shrink-0", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
              {item.name}
            </Link>
          );
        })}
        
        <div className="py-2">
          <div className="h-px bg-white/10 my-2" />
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all text-slate-400 hover:bg-white/5 hover:text-white group"
        >
          <LayoutDashboard className="w-4.5 h-4.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
          User Dashboard
        </Link>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-[#0F172A] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {user.image ? (
            <Image src={user.image} alt="User Avatar" width={32} height={32} className="rounded-full border border-[#0F172A]" unoptimized />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white border border-white/5 uppercase">
              {user.name ? user.name[0] : user.email ? user.email[0] : "A"}
            </div>
          )}
          <div className="overflow-hidden leading-tight">
            <h4 className="text-sm font-bold text-white truncate">
              {user.name || "Admin"}
            </h4>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-white/10 hover:text-white transition-colors shrink-0"
          title="Sign Out"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>
    </aside>
  );
}
