"use client";

import { motion } from "framer-motion";
import { TrendingDown, Users, ServerCrash, DollarSign } from "lucide-react";

const problems = [
  {
    title: "Wasted Ad Spend",
    description: "Every fake lead from your paid campaigns costs you money. Stop paying for traffic that converts into invalid emails.",
    icon: DollarSign,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-100",
  },
  {
    title: "Sales Team Frustration",
    description: "Your SDRs waste hours calling and emailing contacts that don't exist. Reduce friction and keep your team focused on real prospects.",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-100",
  },
  {
    title: "Bad CRM Data",
    description: "HubSpot and Salesforce charge by the contact. Stop polluting your expensive CRM databases with disposable testing addresses.",
    icon: ServerCrash,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100",
  },
  {
    title: "Poor Deliverability",
    description: "High bounce rates from invalid emails will destroy your domain reputation. Protect your sender score before it's too late.",
    icon: TrendingDown,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-100",
  }
];

export function ProblemSection() {
  return (
    <section className="py-24 bg-white border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Bad data is quietly costing you thousands.
          </h2>
          <p className="text-lg text-slate-600">
            Every time a disposable or fake email enters your pipeline, it triggers a chain reaction of wasted resources and degraded performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-6 p-8 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl ${problem.bgColor} ${problem.borderColor} border`}>
                  <Icon className={`w-7 h-7 ${problem.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-base text-slate-600 leading-relaxed">
                    {problem.description}
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
