"use client";

import { motion } from "framer-motion";
import { MailX, Building2, UserX, SpellCheck, Globe2, ShieldBan } from "lucide-react";

const features = [
  {
    title: "Disposable Email Detection",
    benefit: "Block temporary testing addresses instantly.",
    outcome: "Prevents polluted CRM data and saves pay-per-contact database costs.",
    icon: MailX,
  },
  {
    title: "Role Account Detection",
    benefit: "Flag admin@, info@, and support@ emails.",
    outcome: "Ensures your sales team connects directly with decision-makers.",
    icon: Building2,
  },
  {
    title: "Typo Suggestions",
    benefit: "Auto-suggest corrections (e.g., gmial.com → gmail.com).",
    outcome: "Recovers up to 15% of lost leads caused by fat-finger mistakes.",
    icon: SpellCheck,
  },
  {
    title: "Public Provider Rules",
    benefit: "Block free emails (Gmail, Yahoo) on B2B forms.",
    outcome: "Forces leads to use their company emails, improving lead quality.",
    icon: UserX,
  },
  {
    title: "TLD Validation",
    benefit: "Cross-check domains against valid active TLD lists.",
    outcome: "Eliminates spam bots submitting random, non-existent website extensions.",
    icon: Globe2,
  },
  {
    title: "Custom Blocklists",
    benefit: "Build proprietary domain and email blocklists.",
    outcome: "Prevent competitors or known bad actors from downloading your assets.",
    icon: ShieldBan,
  }
];

export function FeaturesGridSection() {
  return (
    <section className="py-24 bg-white border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Enterprise-grade validation engine.
          </h2>
          <p className="text-lg text-slate-600">
            LeadCop checks over 24+ data points in under 400 milliseconds to guarantee the quality of your inbound leads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="flex flex-col p-8 rounded-3xl border border-slate-200 bg-white hover:border-[#FF7A00]/50 hover:shadow-xl hover:shadow-[#FF7A00]/5 transition-all group"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-[#FF7A00] transition-colors mb-6">
                  <Icon className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-base text-slate-600 mb-4 flex-grow">
                  {feature.benefit}
                </p>

                <div className="pt-4 border-t border-slate-100 mt-auto">
                  <span className="text-xs font-bold tracking-wider text-slate-400 uppercase block mb-1">Business Outcome</span>
                  <p className="text-sm font-medium text-slate-800">
                    {feature.outcome}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
