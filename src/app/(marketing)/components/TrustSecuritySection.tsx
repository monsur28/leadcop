"use client";

import { motion } from "framer-motion";
import { Lock, FileKey2, ShieldCheck, Zap } from "lucide-react";

export function TrustSecuritySection() {
  return (
    <section className="py-24 bg-white border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700 mb-6">
              <Lock className="w-4 h-4 mr-2" />
              Privacy First Architecture
            </div>
            
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-6">
              We do not store your leads.
            </h2>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              We believe in data minimalism. LeadCop processes email addresses strictly in memory to validate them, and then instantly drops the PII. Only anonymized, domain-level analytics are stored to calculate your usage.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {[
              {
                icon: FileKey2,
                title: "GDPR Compliant",
                desc: "No PII (Personally Identifiable Information) is persisted in our databases.",
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100"
              },
              {
                icon: ShieldCheck,
                title: "Enterprise Security",
                desc: "All traffic is encrypted via TLS 1.3. API Keys are cryptographically hashed.",
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                border: "border-emerald-100"
              },
              {
                icon: Zap,
                title: "Lightweight",
                desc: "Our script is under 15KB and loads asynchronously, guaranteeing zero impact on your core web vitals.",
                color: "text-amber-600",
                bg: "bg-amber-50",
                border: "border-amber-100"
              },
              {
                icon: Lock,
                title: "Domain Restricted",
                desc: "Your public API keys are strictly locked to your specific website domains.",
                color: "text-indigo-600",
                bg: "bg-indigo-50",
                border: "border-indigo-100"
              }
            ].map((feature, idx) => (
              <div key={idx} className={`p-6 rounded-2xl border ${feature.border} bg-white shadow-sm flex flex-col`}>
                <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
