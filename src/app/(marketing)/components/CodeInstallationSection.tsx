"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, Copy } from "lucide-react";

const steps = [
  { id: 1, title: "Add Domain", desc: "Whitelists your website for API access." },
  { id: 2, title: "Generate API Key", desc: "Get your domain-restricted public key." },
  { id: 3, title: "Paste Script", desc: "Add to your <head> tag." },
  { id: 4, title: "Protected", desc: "Forms are now automatically protected." }
];

const stepContent: Record<number, { fileName: string; copyText: string; code: React.ReactNode }> = {
  1: {
    fileName: "add-domain.json",
    copyText: `{ "hostname": "yourcompany.com" }`,
    code: (
      <>
        <span className="text-slate-500">{"// 1. Register your domain in the LeadCop dashboard"}</span>
        <br />
        <span className="text-pink-400">{"{"}</span>
        <br />
        <span className="text-sky-300 ml-4">&quot;hostname&quot;:</span> <span className="text-green-300">&quot;yourcompany.com&quot;</span>,
        <br />
        <span className="text-sky-300 ml-4">&quot;isActive&quot;:</span> <span className="text-amber-300">true</span>
        <br />
        <span className="text-pink-400">{"}"}</span>
      </>
    )
  },
  2: {
    fileName: "api-key.json",
    copyText: `lc_live_pk_your_public_api_key`,
    code: (
      <>
        <span className="text-slate-500">{"// 2. Copy the generated domain-restricted API key"}</span>
        <br />
        <span className="text-pink-400">{"{"}</span>
        <br />
        <span className="text-sky-300 ml-4">&quot;keyName&quot;:</span> <span className="text-green-300">&quot;Prod Form Key&quot;</span>,
        <br />
        <span className="text-sky-300 ml-4">&quot;type&quot;:</span> <span className="text-green-300">&quot;PUBLIC&quot;</span>,
        <br />
        <span className="text-sky-300 ml-4">&quot;apiKey&quot;:</span> <span className="text-green-300">&quot;lc_live_pk_your_public_api_key&quot;</span>
        <br />
        <span className="text-pink-400">{"}"}</span>
      </>
    )
  },
  3: {
    fileName: "index.html",
    copyText: `<script src="https://cdn.leadcop.io/leadcop.js" data-api-key="lc_live_pk_your_public_api_key"></script>`,
    code: (
      <>
        <span className="text-slate-500">&lt;!-- 3. Drop snippet into your HTML &lt;head&gt; --&gt;</span>
        <br />
        <span className="text-pink-400">&lt;script</span>
        <br />
        <span className="text-sky-300 ml-4">src=</span><span className="text-green-300">&quot;https://cdn.leadcop.io/leadcop.js&quot;</span>
        <br />
        <span className="text-sky-300 ml-4">data-api-key=</span><span className="text-green-300">&quot;lc_live_pk_your_public_api_key&quot;</span><span className="text-pink-400">&gt;</span>
        <br />
        <span className="text-pink-400">&lt;/script&gt;</span>
      </>
    )
  },
  4: {
    fileName: "console.log",
    copyText: `[LeadCop] Status: BLOCKED (Disposable Address)`,
    code: (
      <>
        <span className="text-slate-500">{"// 4. Automatic form scanning & protection in action"}</span>
        <br />
        <span className="text-sky-300">&gt; [LeadCop] Scan:</span> <span className="text-slate-300">Found 1 email form input field.</span>
        <br />
        <span className="text-sky-300">&gt; [LeadCop] Input:</span> <span className="text-slate-300">User entered &quot;test@tempmail.com&quot;</span>
        <br />
        <span className="text-yellow-400">&gt; [LeadCop] Status:</span> <span className="text-red-400">BLOCKED (Disposable Address)</span>
        <br />
        <span className="text-green-400">&gt; [LeadCop] Action:</span> <span className="text-slate-300">Prevented form submission & displayed validation error.</span>
      </>
    )
  }
};

export function CodeInstallationSection() {
  const [activeStep, setActiveStep] = useState(1);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const textToCopy = stepContent[activeStep]?.copyText || "";
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeContent = stepContent[activeStep] || stepContent[1];

  return (
    <section className="py-24 bg-slate-900 border-b border-slate-800 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: UI Steps */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4">
              One line of code. <br/><span className="text-[#FF7A00]">Universal protection.</span>
            </h2>
            <p className="text-lg text-slate-400 mb-10 max-w-md">
              Don&apos;t use WordPress? Our vanilla JavaScript snippet binds to any HTML form on any framework automatically.
            </p>

            <div className="space-y-4">
              {steps.map((step) => (
                <div 
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                    activeStep === step.id 
                      ? 'bg-white/10 border-white/20 shadow-lg' 
                      : 'bg-transparent border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0 mt-0.5 ${
                    activeStep === step.id ? 'bg-[#FF7A00] text-white' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {step.id}
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold mb-1 ${activeStep === step.id ? 'text-white' : 'text-slate-300'}`}>
                      {step.title}
                    </h4>
                    <AnimatePresence>
                      {activeStep === step.id && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }} 
                          exit={{ opacity: 0, height: 0 }}
                          className="text-slate-400 text-sm"
                        >
                          {step.desc}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  {activeStep === step.id && <ChevronRight className="ml-auto w-5 h-5 text-[#FF7A00] mt-1.5" />}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Code Window */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full"
          >
            <div className="bg-[#0D1117] rounded-xl border border-slate-800 shadow-2xl overflow-hidden font-mono text-sm">
              <div className="flex items-center justify-between px-4 py-3 bg-[#161B22] border-b border-slate-800">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                </div>
                <div className="text-slate-500 text-xs">{activeContent.fileName}</div>
                <button 
                  onClick={copyToClipboard}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-6 overflow-x-auto min-h-[220px] flex items-center">
                <pre className="leading-loose w-full">
                  <code className="text-slate-300">
                    {activeContent.code}
                  </code>
                </pre>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
