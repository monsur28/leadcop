"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Terminal, Code2 } from "lucide-react";

interface WebsiteInstallationTabsProps {
  apiKeyHint: string;
}

export function WebsiteInstallationTabs({ apiKeyHint }: WebsiteInstallationTabsProps) {
  const [activeTab, setActiveTab] = useState<"html" | "react" | "next" | "wordpress">("html");
  const [copied, setCopied] = useState(false);

  const snippets = {
    html: `<!-- Drop snippet into your HTML <head> -->
<script 
  src="https://cdn.leadcop.io/leadcop.js" 
  data-api-key="${apiKeyHint}">
</script>`,
    react: `npm install @leadcop/react

// App.tsx
import { LeadCopProvider } from '@leadcop/react';

function App() {
  return (
    <LeadCopProvider apiKey="${apiKeyHint}">
      <YourApp />
    </LeadCopProvider>
  );
}`,
    next: `npm install @leadcop/next

// app/layout.tsx
import { LeadCopScript } from '@leadcop/next';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <LeadCopScript apiKey="${apiKeyHint}" />
      </head>
      <body>{children}</body>
    </html>
  );
}`,
    wordpress: `1. Install the "LeadCop" plugin from WordPress directory
2. Navigate to LeadCop Settings in your WP Admin
3. Paste your API Key:
   ${apiKeyHint}
4. Select "Block Invalid Emails" and click Save Changes`
  };

  const copyToClipboard = () => {
    const text = snippets[activeTab];
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(err => console.error(err));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try { document.execCommand('copy'); } catch (err) { console.error(err); }
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: "html", label: "HTML" },
    { id: "react", label: "React" },
    { id: "next", label: "Next.js" },
    { id: "wordpress", label: "WordPress" }
  ] as const;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-[#FF7A00]/10 rounded-xl text-[#FF7A00]">
          <Terminal className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Installation</h3>
          <p className="text-[11px] text-slate-500 font-medium">Add LeadCop to your website in seconds.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
              activeTab === tab.id 
                ? "bg-slate-900 text-white shadow-sm" 
                : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative group">
        <div className="absolute right-3 top-3">
          <Button 
            onClick={copyToClipboard}
            className="h-8 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1 rounded-md text-[10px] font-bold backdrop-blur-sm"
          >
            {copied ? <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span> : <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</span>}
          </Button>
        </div>
        <pre className="bg-slate-900 text-slate-300 p-5 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed border border-slate-800 custom-scrollbar">
          <code>{snippets[activeTab]}</code>
        </pre>
      </div>
    </div>
  );
}
