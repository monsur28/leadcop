"use client";

import { motion } from "framer-motion";
import { ShieldCheck, BarChart3, Globe, Key, AlertTriangle, Search } from "lucide-react";

export function DashboardPreviewSection() {
  return (
    <section className="py-24 bg-white border-b border-slate-100 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-4">
            See exactly what LeadCop blocks.
          </h2>
          <p className="text-lg text-slate-600">
            Gain full visibility into your lead quality with our intuitive dashboard. Track validation usage, manage domains, and monitor blocked threats in real-time.
          </p>
        </div>

        {/* Full Width Dashboard Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-[#F8FAFC] shadow-2xl overflow-hidden"
        >
          {/* Top Navbar */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#FF7A00] rounded-md flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800 tracking-tight">LeadCop</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-400">
                <Search className="w-3 h-3" /> Search domains...
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row h-full">
            {/* Sidebar */}
            <div className="w-full md:w-56 bg-white border-r border-slate-200 p-4 flex flex-col gap-1 hidden sm:flex">
              <div className="flex items-center gap-3 px-3 py-2 bg-slate-100 text-slate-900 rounded-lg text-sm font-semibold">
                <BarChart3 className="w-4 h-4" /> Overview
              </div>
              <div className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium">
                <Globe className="w-4 h-4" /> Domains
              </div>
              <div className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium">
                <Key className="w-4 h-4" /> API Keys
              </div>
              <div className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium">
                <AlertTriangle className="w-4 h-4" /> Validation Logs
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 md:p-8 space-y-6">
              
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Dashboard Overview</h3>
                  <p className="text-sm text-slate-500">Your validation statistics for the last 30 days.</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Validations Used", value: "24,592", sub: "of 50,000 (Growth Plan)" },
                  { label: "Blocked Leads", value: "3,140", sub: "Saved $1,570 in CRM costs" },
                  { label: "Protected Domains", value: "4", sub: "Active" },
                  { label: "Active API Keys", value: "2", sub: "Production" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{stat.label}</span>
                    <span className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</span>
                    <span className="text-xs text-slate-400">{stat.sub}</span>
                  </div>
                ))}
              </div>

              {/* Fake Chart Area */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-64 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-slate-800">Validation Volume</span>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300"/> Valid</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FF7A00]"/> Blocked</div>
                  </div>
                </div>
                {/* CSS Chart Simulation */}
                <div className="flex-1 flex items-end justify-between gap-2 px-2">
                  {[40, 65, 45, 80, 55, 90, 75, 40, 60, 85, 50, 70].map((h, i) => (
                    <div key={i} className="w-full flex flex-col justify-end gap-1 h-full">
                      <div className="bg-[#FF7A00] opacity-80 rounded-t-sm w-full transition-all" style={{ height: `${h * 0.2}%` }} />
                      <div className="bg-slate-200 rounded-b-sm w-full transition-all" style={{ height: `${h * 0.8}%` }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Fake Logs Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hidden md:block">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <span className="font-bold text-slate-800">Recent Blocks</span>
                </div>
                <div className="p-0">
                  {[
                    { email: "j***@mailinator.com", reason: "Disposable Domain", date: "2 mins ago" },
                    { email: "a***@company.com", reason: "Role Account", date: "15 mins ago" },
                    { email: "t***@temp-mail.org", reason: "Disposable Domain", date: "1 hour ago" },
                  ].map((log, i) => (
                    <div key={i} className="flex justify-between items-center px-6 py-3 border-b border-slate-50 last:border-0 text-sm hover:bg-slate-50">
                      <span className="font-mono text-slate-600">{log.email}</span>
                      <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-semibold">{log.reason}</span>
                      <span className="text-slate-400 text-xs">{log.date}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
          
          {/* Overlay fade out at bottom to blend into next section if desired */}
          {/* <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F8FAFC] to-transparent pointer-events-none" /> */}
        </motion.div>
      </div>
    </section>
  );
}
