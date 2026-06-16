"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How accurate is LeadCop?",
    answer: "LeadCop analyzes over 24 global data points in under 150ms, cross-referencing known disposable domains, role-based prefixes, active MX records, and domain syntax. Our validation accuracy rate is 99.9%."
  },
  {
    question: "Will LeadCop slow down my website forms?",
    answer: "Not at all. LeadCop runs asynchronously on distributed edge servers. Validation resolves in milliseconds in the background, ensuring zero latency or friction for real users submitting forms."
  },
  {
    question: "How does LeadCop handle typos?",
    answer: "Instead of blocking users for innocent spelling errors, LeadCop detects common domain typos (like 'gmial.com' or 'yhaoo.com') and suggests corrections dynamically. This recovers up to 15% of lost leads."
  },
  {
    question: "Is LeadCop GDPR and data-privacy compliant?",
    answer: "Yes, fully. LeadCop processes email addresses strictly in memory to perform validation and immediately discards them. We do not store, log, or sell any personal lead data."
  },
  {
    question: "How long does setup take?",
    answer: "Under 5 minutes. If you use WordPress, simply install our official plugin. For custom sites and SPAs, paste a single line of JavaScript into your HTML <head> tag to protect all forms instantly."
  }
];

export function FaqSection() {
  return (
    <section className="py-24 bg-slate-50 border-b border-slate-100">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-slate-600">
            Everything you need to know about protecting your leads.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm"
        >
          <Accordion className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-slate-100">
                <AccordionTrigger className="text-left text-lg font-semibold text-slate-800 hover:text-[#FF7A00] transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-slate-600 leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

      </div>
    </section>
  );
}
