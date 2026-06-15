import { ReactNode } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      {/* Global Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold">
                LC
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">LeadCop</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link href="#features" className="hover:text-slate-900 transition-colors">Features</Link>
              <Link href="#how-it-works" className="hover:text-slate-900 transition-colors">How it Works</Link>
              <Link href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
              <Link href="/docs" className="hover:text-slate-900 transition-colors">Documentation</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
            <Link href="/register" className={cn(buttonVariants(), "bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6")}>
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content (Sections injected here) */}
      <main className="flex-1">
        {children}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-white text-xs font-bold">LC</div>
                <span className="text-lg font-bold tracking-tight text-slate-900">LeadCop</span>
              </div>
              <p className="text-sm text-slate-500">
                Enterprise-grade email validation to stop fake leads before they hit your CRM.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-slate-900">Product</h4>
              <Link href="#features" className="text-sm text-slate-500 hover:text-slate-900">Features</Link>
              <Link href="#pricing" className="text-sm text-slate-500 hover:text-slate-900">Pricing</Link>
              <Link href="/demo" className="text-sm text-slate-500 hover:text-slate-900">Interactive Demo</Link>
            </div>
            
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-slate-900">Resources</h4>
              <Link href="/docs" className="text-sm text-slate-500 hover:text-slate-900">Documentation</Link>
              <Link href="/wordpress" className="text-sm text-slate-500 hover:text-slate-900">WordPress Plugin</Link>
              <Link href="/api-reference" className="text-sm text-slate-500 hover:text-slate-900">API Reference</Link>
            </div>
            
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-slate-900">Company</h4>
              <Link href="/about" className="text-sm text-slate-500 hover:text-slate-900">About Us</Link>
              <Link href="/support" className="text-sm text-slate-500 hover:text-slate-900">Support</Link>
              <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-900">Privacy Policy</Link>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} LeadCop Inc. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              {/* Social icons could go here */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
