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
    answer: "LeadCop analyzes over 24 global data points in under 400ms, cross-referencing known disposable domains, role-based prefixes, and active DNS records. Our accuracy rate is 99.9%."
  },
  {
    question: "Does it work with WordPress?",
    answer: "Yes! We have an official WordPress plugin that automatically binds to Contact Form 7, WPForms, Elementor Forms, and WooCommerce without writing any code."
  },
  {
    question: "Can I use it without coding?",
    answer: "Absolutely. If you use WordPress, you just install the plugin. If you use a custom site, you just paste one line of JavaScript into your <head> tag. That's it."
  },
  {
    question: "Does LeadCop store the emails?",
    answer: "No. LeadCop processes the email strictly in memory for validation and immediately drops it. We only store anonymized logs (e.g., 'Validation blocked for domain X') to calculate your usage."
  },
  {
    question: "How long does setup take?",
    answer: "Less than 2 minutes. Create an account, add your domain, generate an API key, and paste the snippet. You'll be protected instantly."
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
