import { ReactNode } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      {/* Floating Island Global Navigation */}
      <div className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4">
        <header className="mx-auto max-w-6xl rounded-full border border-slate-200/60 bg-white/75 backdrop-blur-xl shadow-md shadow-slate-100/40">
          <div className="flex h-14 items-center justify-between px-6">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#FF7A00] to-[#FF9F43] text-white shadow-sm shadow-orange-500/10 group-hover:scale-105 transition-all duration-300">
                  <ShieldCheck className="h-4.5 w-4.5 stroke-[2.5]" />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-950">
                  LeadCop
                </span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
                <Link href="#features" className="px-3.5 py-1.5 rounded-full hover:bg-slate-100/60 hover:text-slate-950 transition-all duration-200">Features</Link>
                <Link href="#how-it-works" className="px-3.5 py-1.5 rounded-full hover:bg-slate-100/60 hover:text-slate-950 transition-all duration-200">How it Works</Link>
                <Link href="#pricing" className="px-3.5 py-1.5 rounded-full hover:bg-slate-100/60 hover:text-slate-950 transition-all duration-200">Pricing</Link>
                <Link href="/docs" className="px-3.5 py-1.5 rounded-full hover:bg-slate-100/60 hover:text-slate-950 transition-all duration-200">Documentation</Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors">
                Log in
              </Link>
              <Link href="/register" className={cn(buttonVariants(), "bg-slate-950 hover:bg-slate-900 text-white rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] shadow-sm shadow-slate-950/10 border-none")}>
                Start Free
              </Link>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content (Sections injected here) */}
      <main className="flex-1">
        {children}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-2 group w-fit">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#FF7A00] to-[#FF9F43] text-white shadow-md shadow-orange-500/10 group-hover:scale-105 transition-all duration-300">
                  <ShieldCheck className="h-4.5 w-4.5 stroke-[2.5]" />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-950">
                  LeadCop
                </span>
              </Link>
              <p className="text-sm text-slate-500 leading-relaxed">
                Enterprise-grade email validation to stop fake leads before they hit your CRM.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-slate-900 text-sm">Product</h4>
              <Link href="#features" className="text-sm text-slate-500 hover:text-[#FF7A00] transition-colors">Features</Link>
              <Link href="#pricing" className="text-sm text-slate-500 hover:text-[#FF7A00] transition-colors">Pricing</Link>
              <Link href="/demo" className="text-sm text-slate-500 hover:text-[#FF7A00] transition-colors">Interactive Demo</Link>
            </div>
            
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-slate-900 text-sm">Resources</h4>
              <Link href="/docs" className="text-sm text-slate-500 hover:text-[#FF7A00] transition-colors">Documentation</Link>
              <Link href="/wordpress" className="text-sm text-slate-500 hover:text-[#FF7A00] transition-colors">WordPress Plugin</Link>
              <Link href="/api-reference" className="text-sm text-slate-500 hover:text-[#FF7A00] transition-colors">API Reference</Link>
            </div>
            
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-slate-900 text-sm">Company</h4>
              <Link href="/about" className="text-sm text-slate-500 hover:text-[#FF7A00] transition-colors">About Us</Link>
              <Link href="/support" className="text-sm text-slate-500 hover:text-[#FF7A00] transition-colors">Support</Link>
              <Link href="/privacy" className="text-sm text-slate-500 hover:text-[#FF7A00] transition-colors">Privacy Policy</Link>
            </div>
          </div>
          <div className="mt-16 border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-slate-400">© {new Date().getFullYear()} LeadCop Inc. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              {/* Social icons could go here */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
