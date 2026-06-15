"use client";

import { motion } from "framer-motion";
import { ArrowDown, Filter, ShieldCheck, XCircle, AlertTriangle, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

export function BeforeAfterSection() {
  return (
    <section className="py-20 bg-slate-50 border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-4">
            The true cost of an unprotected funnel.
          </h2>
          <p className="text-lg text-slate-600">
            See how much bad data is polluting your CRM when you don&apos;t validate leads at the source.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Without LeadCop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="bg-slate-100 border-b border-slate-200 px-6 py-4 text-center">
              <span className="text-sm font-bold tracking-widest text-slate-500 uppercase">Without LeadCop</span>
            </div>
            
            <div className="p-8 flex-1 flex flex-col items-center">
              <div className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-xl p-4 text-center mb-6 shadow-sm">
                <span className="block text-2xl font-bold text-slate-900">1,000</span>
                <span className="text-sm font-medium text-slate-500">Raw Leads Collected</span>
              </div>

              <div className="flex flex-col items-center mb-6">
                <Filter className="w-8 h-8 text-slate-300 mb-2" />
                <ArrowDown className="w-6 h-6 text-slate-300" />
              </div>

              <div className="w-full max-w-xs space-y-3 mb-8">
                <div className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500"/> <span className="text-sm font-medium text-red-800">Disposable</span></div>
                  <span className="font-bold text-red-600">180</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 border border-orange-100 rounded-lg">
                  <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500"/> <span className="text-sm font-medium text-orange-800">Role Emails</span></div>
                  <span className="font-bold text-orange-600">90</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-500"/> <span className="text-sm font-medium text-amber-800">Typos</span></div>
                  <span className="font-bold text-amber-600">60</span>
                </div>
              </div>

              <div className="mt-auto w-full max-w-xs bg-slate-900 rounded-xl p-5 text-center shadow-lg relative">
                <TrendingDown className="absolute -top-3 -right-3 w-8 h-8 text-red-400 bg-slate-900 rounded-full border-4 border-white p-1" />
                <span className="block text-xl font-bold text-white mb-1">Dirty CRM</span>
                <span className="text-sm font-medium text-red-400">Wasted Ad Spend & Low Deliverability</span>
              </div>
            </div>
          </motion.div>

          {/* With LeadCop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl border-2 border-[#FF7A00] shadow-xl shadow-[#FF7A00]/10 overflow-hidden flex flex-col relative"
          >
            <div className="bg-[#FF7A00] px-6 py-4 text-center">
              <span className="text-sm font-bold tracking-widest text-white uppercase">With LeadCop</span>
            </div>
            
            <div className="p-8 flex-1 flex flex-col items-center">
              <div className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-xl p-4 text-center mb-6 shadow-sm relative z-10">
                <span className="block text-2xl font-bold text-slate-900">1,000</span>
                <span className="text-sm font-medium text-slate-500">Raw Leads Attempted</span>
              </div>

              <div className="flex flex-col items-center mb-6 relative z-10">
                <div className="bg-white rounded-full p-2 shadow-md border border-slate-100 mb-2">
                  <ShieldCheck className="w-8 h-8 text-[#FF7A00]" />
                </div>
                <ArrowDown className="w-6 h-6 text-[#FF7A00]" />
              </div>

              <div className="w-full max-w-xs space-y-3 mb-8 relative">
                {/* Visual deflection */}
                <div className="absolute -left-12 top-0 text-red-400 text-xs font-bold animate-bounce opacity-50 flex items-center gap-1"><XCircle className="w-3 h-3"/> Blocked</div>
                <div className="absolute -right-12 top-8 text-orange-400 text-xs font-bold animate-bounce opacity-50 flex items-center gap-1" style={{ animationDelay: "0.2s" }}><AlertTriangle className="w-3 h-3"/> Blocked</div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-500"/> <span className="text-base font-bold text-green-800">Clean Leads</span></div>
                  <span className="font-extrabold text-green-600 text-xl">968*</span>
                </div>
                <p className="text-center text-[10px] text-slate-400 mt-2">*Includes 168 leads saved by Typo Correction</p>
              </div>

              <div className="mt-auto w-full max-w-xs bg-slate-900 rounded-xl p-5 text-center shadow-xl relative z-10 border border-slate-800">
                <TrendingUp className="absolute -top-3 -right-3 w-8 h-8 text-green-400 bg-slate-900 rounded-full border-4 border-white p-1" />
                <span className="block text-xl font-bold text-white mb-1">Pristine CRM</span>
                <span className="text-sm font-medium text-green-400">High Deliverability & Better ROI</span>
              </div>
            </div>
            
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FF7A00]/5 blur-3xl rounded-full z-0" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
