"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Download, Settings, Zap } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WordPressPluginSection() {
  return (
    <section className="py-24 bg-white border-b border-slate-100 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Copy */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
              Native WordPress Integration
            </div>
            
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-6">
              Install once. Protect every form automatically.
            </h2>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Are you running lead generation campaigns to a WordPress site? Our official plugin brings enterprise-grade lead protection directly to your WP Admin dashboard. No coding required.
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                { icon: ShieldCheck, text: "Automatically protects Contact Form 7, WPForms, and Elementor." },
                { icon: Zap, text: "Zero configuration. Just paste your API key." },
                { icon: Settings, text: "Customize block rules directly from the WP Admin dashboard." }
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <item.icon className="h-6 w-6 text-[#FF7A00] mt-0.5 mr-3 shrink-0" />
                  <span className="text-slate-700 font-medium">{item.text}</span>
                </li>
              ))}
            </ul>

            <Link 
              href="/docs/wordpress" 
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }), 
                "rounded-full px-8 h-12 text-base border-slate-300 text-slate-800 font-semibold shadow-sm hover:bg-slate-50"
              )}
            >
              <Download className="mr-2 h-4 w-4" /> View Documentation
            </Link>
          </motion.div>

          {/* Right Column: Plugin Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-[#1E1E1E] rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
              {/* Fake WP Top Bar */}
              <div className="bg-[#23282D] px-4 py-2 flex items-center border-b border-[#32373C]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="mx-auto text-xs text-slate-400 font-medium tracking-wide">WordPress Admin</div>
              </div>
              
              {/* Fake WP Sidebar + Content Area */}
              <div className="flex bg-[#F1F1F1] h-[360px]">
                {/* Sidebar */}
                <div className="w-48 bg-[#23282D] hidden sm:block p-4">
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-[#32373C] rounded mb-6" />
                    <div className="h-3 w-full bg-[#32373C] rounded" />
                    <div className="h-3 w-3/4 bg-[#32373C] rounded" />
                    <div className="h-3 w-5/6 bg-[#32373C] rounded" />
                    <div className="h-8 w-full bg-[#FF7A00]/20 rounded border border-[#FF7A00]/50 flex items-center px-2 mt-4">
                      <ShieldCheck className="h-4 w-4 text-[#FF7A00] mr-2" />
                      <div className="h-2 w-16 bg-[#FF7A00] rounded" />
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-6 lg:p-8 bg-white">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">LeadCop Settings</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Public API Key</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-10 border border-slate-300 rounded bg-slate-50 px-3 flex items-center">
                          <span className="text-slate-400 font-mono text-sm">lc_live_8f92j2...</span>
                        </div>
                        <div className="h-10 w-24 bg-[#FF7A00] rounded flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">Save</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">Active Protections</label>
                      {[
                        { text: "Block Disposable Emails", active: true },
                        { text: "Block Role-Based Accounts", active: true },
                        { text: "Require Business Domains", active: false }
                      ].map((setting, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded">
                          <span className="text-sm text-slate-700">{setting.text}</span>
                          <div className={`w-10 h-5 rounded-full relative ${setting.active ? 'bg-green-500' : 'bg-slate-300'}`}>
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${setting.active ? 'right-0.5' : 'left-0.5'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
