"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    description: "For Testing",
    price: "$0",
    features: [
      "1,000 Validations / mo",
      "Disposable Email Block",
      "1 Domain Protected",
      "Community Support"
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Starter",
    description: "For Small Businesses",
    price: "$29",
    features: [
      "10,000 Validations / mo",
      "Role Account Block",
      "1 Domain Protected",
      "Email Support"
    ],
    cta: "Start Starter Trial",
    popular: false,
  },
  {
    name: "Growth",
    description: "For Marketing Teams",
    price: "$99",
    features: [
      "50,000 Validations / mo",
      "Typo Corrections",
      "Unlimited Domains",
      "Priority Support"
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Agency",
    description: "For Multiple Websites",
    price: "$299",
    features: [
      "250,000 Validations / mo",
      "Custom Blocklists",
      "Team Management",
      "Dedicated Manager"
    ],
    cta: "Contact Sales",
    popular: false,
  }
];

export function PricingPreviewSection() {
  return (
    <section className="py-24 bg-white border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Simple, transparent pricing.
          </h2>
          <p className="text-lg text-slate-600">
            Pay only for the value you protect. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col p-8 rounded-3xl bg-white transition-all ${
                plan.popular 
                  ? 'border-2 border-[#FF7A00] shadow-xl shadow-[#FF7A00]/10 scale-100 lg:scale-105 z-10' 
                  : 'border border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FF7A00] text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{plan.description}</p>
              </div>
              
              <div className="mb-8 flex items-baseline text-slate-900">
                <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                <span className="ml-1 text-sm font-semibold text-slate-500">/mo</span>
              </div>
              
              <ul className="flex-1 space-y-4 mb-8 text-sm">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start">
                    <Check className={`h-4 w-4 shrink-0 mt-0.5 mr-3 ${plan.popular ? 'text-[#FF7A00]' : 'text-slate-400'}`} />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                href={plan.popular ? "/register" : "/pricing"}
                className={cn(
                  buttonVariants({ size: "lg", variant: plan.popular ? "default" : "outline" }), 
                  plan.popular 
                    ? "w-full bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl h-12 text-sm font-bold shadow-md shadow-[#FF7A00]/20" 
                    : "w-full rounded-xl h-12 text-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
