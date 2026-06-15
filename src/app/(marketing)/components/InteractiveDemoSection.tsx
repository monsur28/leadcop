"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2, MailWarning } from "lucide-react";

type ValidationStatus = "idle" | "loading" | "valid" | "disposable" | "role" | "public" | "typo";

export function InteractiveDemoSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<ValidationStatus>("idle");

  const simulateValidation = () => {
    if (!email) return;
    setStatus("loading");
    
    // Simulate API delay for UX
    setTimeout(() => {
      const e = email.toLowerCase();
      if (e.includes("mailinator") || e.includes("temp")) setStatus("disposable");
      else if (e.startsWith("admin@") || e.startsWith("info@")) setStatus("role");
      else if (e.includes("gmail") || e.includes("yahoo")) setStatus("public");
      else if (e.includes("gmial")) setStatus("typo");
      else setStatus("valid");
    }, 800);
  };

  return (
    <section id="interactive-demo" className="py-20 bg-slate-50 border-y border-slate-100">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Test LeadCop Instantly
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            See how our validation engine classifies different email addresses in real-time. Try entering a disposable or role-based email.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/40 relative z-10"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                onKeyDown={(e) => e.key === "Enter" && simulateValidation()}
                placeholder="test@mailinator.com"
                className="w-full h-14 text-lg bg-slate-50 border-slate-200 focus-visible:ring-[#FF7A00] focus-visible:border-[#FF7A00] rounded-xl px-4 shadow-inner"
              />
            </div>
            <Button 
              onClick={simulateValidation}
              disabled={status === "loading" || !email}
              className="h-14 px-8 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-base rounded-xl transition-all shadow-md shadow-[#FF7A00]/20"
            >
              {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Validate Email"}
            </Button>
          </div>

          <div className="mt-8 min-h-[64px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {status === "idle" && (
                <motion.div 
                  key="idle" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  className="flex gap-3 text-sm text-slate-500 font-medium"
                >
                  <span className="cursor-pointer hover:text-[#FF7A00] transition-colors" onClick={() => {setEmail("test@mailinator.com"); setStatus("idle");}}>test@mailinator.com</span>
                  <span>•</span>
                  <span className="cursor-pointer hover:text-[#FF7A00] transition-colors" onClick={() => {setEmail("admin@example.com"); setStatus("idle");}}>admin@example.com</span>
                  <span>•</span>
                  <span className="cursor-pointer hover:text-[#FF7A00] transition-colors" onClick={() => {setEmail("john@gmial.com"); setStatus("idle");}}>john@gmial.com</span>
                </motion.div>
              )}
              
              {status === "loading" && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center text-sm font-medium text-slate-500">
                  <Loader2 className="mr-3 h-5 w-5 animate-spin text-[#FF7A00]" /> Analyzing 24+ global databases...
                </motion.div>
              )}

              {status === "disposable" && (
                <motion.div key="disposable" initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="flex items-center gap-3 bg-red-50 text-red-700 px-6 py-3 rounded-xl border border-red-200 font-semibold text-base shadow-sm">
                  <MailWarning className="h-6 w-6 text-red-500" /> Disposable Email Blocked
                </motion.div>
              )}

              {status === "role" && (
                <motion.div key="role" initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="flex items-center gap-3 bg-orange-50 text-orange-700 px-6 py-3 rounded-xl border border-orange-200 font-semibold text-base shadow-sm">
                  <AlertCircle className="h-6 w-6 text-orange-500" /> Role Account Detected
                </motion.div>
              )}

              {status === "valid" && (
                <motion.div key="valid" initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="flex items-center gap-3 bg-green-50 text-green-700 px-6 py-3 rounded-xl border border-green-200 font-semibold text-base shadow-sm">
                  <CheckCircle2 className="h-6 w-6 text-green-500" /> Safe and Valid Email
                </motion.div>
              )}

              {status === "typo" && (
                <motion.div key="typo" initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="flex items-center gap-3 bg-blue-50 text-blue-700 px-6 py-3 rounded-xl border border-blue-200 font-semibold text-base shadow-sm">
                  <AlertCircle className="h-6 w-6 text-blue-500" /> Typo Detected: Did you mean gmail.com?
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
