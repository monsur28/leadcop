"use client";

import { motion } from "framer-motion";
import { Globe, Key, Terminal, ShieldCheck } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Add Domain",
    description: "Register your website domain in the LeadCop dashboard to generate a secure environment.",
    icon: Globe,
  },
  {
    step: "02",
    title: "Copy API Key",
    description: "Instantly generate a public API key restricted securely to your specific domain.",
    icon: Key,
  },
  {
    step: "03",
    title: "Install Script",
    description: "Drop a single line of JavaScript into your <head> tag or install our WordPress plugin.",
    icon: Terminal,
  },
  {
    step: "04",
    title: "Forms Protected",
    description: "LeadCop automatically detects email fields and blocks invalid leads in real-time.",
    icon: ShieldCheck,
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-slate-50 border-b border-slate-100 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Integration takes less than 2 minutes.
          </h2>
          <p className="text-lg text-slate-600">
            No complex backend API integrations required. Our drop-in snippet automatically finds and protects every form on your website.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-slate-200" aria-hidden="true" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white border-4 border-[#FF7A00]/10 shadow-xl shadow-[#FF7A00]/5 mb-6 relative">
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#FF7A00] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {step.step}
                    </div>
                    <Icon className="h-10 w-10 text-[#FF7A00]" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-base text-slate-600 leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
