"use client";

import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldAlert, XCircle, Info } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 overflow-hidden bg-white">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-slate-50/50 -skew-y-3 origin-top-left transform -z-10" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Copy & CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 text-left"
          >
            <div className="inline-flex items-center rounded-full border border-[#FF7A00]/20 bg-[#FF7A00]/10 px-3 py-1 text-sm font-medium text-[#FF7A00] mb-6">
              <span className="flex h-2 w-2 rounded-full bg-[#FF7A00] mr-2"></span>
              The Enterprise Lead Protection Platform
            </div>
            
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
              Stop Bad Leads Before They Reach Your CRM.
            </h1>
            
            <p className="text-lg leading-8 text-slate-600 mb-8 max-w-xl">
              Protect your funnels from disposable, fake, and role-based emails with one simple integration. Improve your sender reputation and stop wasting sales time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/register" 
                className={cn(
                  buttonVariants({ size: "lg" }), 
                  "bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-full px-8 h-14 text-base font-semibold shadow-lg shadow-[#FF7A00]/20 transition-all hover:scale-[1.02]"
                )}
              >
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link 
                href="/demo" 
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }), 
                  "rounded-full px-8 h-14 text-base border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                )}
              >
                Book a Demo
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Visual Mockup */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:col-span-7 w-full"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
                <div className="text-xs font-medium text-slate-400 font-mono">Live Validation Engine</div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Monitoring</span>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 flex flex-col gap-3">
                
                {/* Mock Item 1 */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="bg-red-50/50 border border-red-100 rounded-xl p-3 sm:p-4 flex items-center gap-4 justify-between"
                >
                  <div className="flex items-center gap-4">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 hidden sm:block" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900 font-mono mb-0.5">john@mailinator.com</div>
                      <div className="text-xs font-medium text-slate-500">Source: Landing Page Form</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold shrink-0">
                    <XCircle className="w-3.5 h-3.5" /> Blocked: Disposable
                  </div>
                </motion.div>

                {/* Mock Item 2 */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                  className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 sm:p-4 flex items-center gap-4 justify-between"
                >
                  <div className="flex items-center gap-4">
                    <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0 hidden sm:block" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900 font-mono mb-0.5">admin@example.com</div>
                      <div className="text-xs font-medium text-slate-500">Source: Webinar Registration</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold shrink-0">
                    <ShieldAlert className="w-3.5 h-3.5" /> Warning: Role Account
                  </div>
                </motion.div>

                {/* Mock Item 3 */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                  className="bg-green-50/50 border border-green-100 rounded-xl p-3 sm:p-4 flex items-center gap-4 justify-between"
                >
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 hidden sm:block" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900 font-mono mb-0.5">sarah@gmial.com</div>
                      <div className="text-xs font-medium text-slate-500">Source: Pricing Request</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Did you mean gmail.com?
                  </div>
                </motion.div>
                
                {/* Mock Item 4 */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
                  className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 sm:p-4 flex items-center gap-4 justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Info className="w-5 h-5 text-blue-500 shrink-0 hidden sm:block" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900 font-mono mb-0.5">mark@yahoo.com</div>
                      <div className="text-xs font-medium text-slate-500">Source: E-book Download</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold shrink-0">
                    <Info className="w-3.5 h-3.5" /> Flagged: Public Email
                  </div>
                </motion.div>

              </div>
            </div>
            
            {/* Decorative blurs */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#FF7A00] opacity-[0.03] blur-3xl rounded-full" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-slate-500 opacity-[0.03] blur-3xl rounded-full" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
