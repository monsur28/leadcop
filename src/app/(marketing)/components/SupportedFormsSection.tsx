"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const platforms = [
  "Contact Form 7",
  "WPForms",
  "Ninja Forms",
  "Gravity Forms",
  "Elementor Forms",
  "WooCommerce",
  "React / Next.js",
  "Custom HTML Forms"
];

export function SupportedFormsSection() {
  return (
    <section className="py-24 bg-slate-50 border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Works wherever you collect leads.
          </h2>
          <p className="text-lg text-slate-600">
            Our smart JavaScript snippet automatically detects form inputs and binds to submission events, providing universal compatibility without custom coding.
          </p>
        </div>

        <div className="relative flex overflow-hidden py-4">
          <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
          
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 25,
            }}
            className="flex gap-6 pr-6 w-max flex-none hover:[animation-play-state:paused]"
          >
            {[...platforms, ...platforms].map((platform, index) => (
              <div
                key={index}
                className="flex items-center justify-center px-8 py-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-[#FF7A00]/40 transition-all cursor-default flex-none"
              >
                <Check className="w-5 h-5 text-[#FF7A00] mr-3 shrink-0" />
                <span className="font-semibold text-slate-800 whitespace-nowrap">{platform}</span>
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
