"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Activity } from "lucide-react";

export function TrustedBySection() {
  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold text-slate-500 tracking-wider uppercase mb-8">
          Trusted by innovative marketing teams and agencies
        </p>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 border border-slate-200">
              <ShieldCheck className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">2M+</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Leads Protected</div>
            </div>
          </motion.div>

          <div className="hidden md:block w-px h-12 bg-slate-200" />

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 border border-slate-200">
              <Zap className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">&lt; 400ms</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Validation Speed</div>
            </div>
          </motion.div>

          <div className="hidden md:block w-px h-12 bg-slate-200" />

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 border border-slate-200">
              <Activity className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">99.9%</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Uptime SLA</div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
