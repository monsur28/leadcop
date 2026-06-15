"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function CtaFooterSection() {
  return (
    <section className="py-16 bg-[#F8FAFC] border-t border-slate-200">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Ready to stop bad leads before they reach your CRM?
          </h2>
          
          <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
            Protect every form in under 5 minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/register" 
              className={cn(
                buttonVariants({ size: "lg" }), 
                "w-full sm:w-auto bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl px-10 h-14 text-base font-bold shadow-lg shadow-[#FF7A00]/20 transition-all hover:scale-[1.02]"
              )}
            >
              Start Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link 
              href="/demo" 
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }), 
                "w-full sm:w-auto rounded-xl px-10 h-14 text-base border-slate-300 text-slate-800 bg-white hover:bg-slate-50 font-semibold shadow-sm"
              )}
            >
              Book Demo
            </Link>
          </div>
          
          <div className="mt-6 flex justify-center items-center gap-2 text-sm text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-green-500" /> No credit card required. Cancel anytime.
          </div>
        </motion.div>

      </div>
    </section>
  );
}
