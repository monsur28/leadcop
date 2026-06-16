"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Code2, Copy, Check, ArrowRight, Download } from "lucide-react";

interface StepInstallationProps {
  apiKey?: string;
  onNext: () => void;
}

export function StepInstallation({ apiKey, onNext }: StepInstallationProps) {
  const [copiedJs, setCopiedJs] = useState(false);
  const [copiedWp, setCopiedWp] = useState(false);
  const [tabValue, setTabValue] = useState("js");

  const displayKey = apiKey || "lc_pk_your_public_key";
  const jsSnippet = `<script src="https://cdn.leadcop.io/leadcop.js" data-api-key="${displayKey}"></script>`;
  
  const copyJs = () => {
    navigator.clipboard.writeText(jsSnippet);
    setCopiedJs(true);
    setTimeout(() => setCopiedJs(false), 2000);
  };

  const copyWpKey = () => {
    navigator.clipboard.writeText(displayKey);
    setCopiedWp(true);
    setTimeout(() => setCopiedWp(false), 2000);
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
        <Code2 className="w-8 h-8" />
      </div>
      
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Install LeadCop</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Choose your platform and follow the instructions to install the validation engine.
        </p>
      </div>

      <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 mb-8 text-left">
        <Tabs value={tabValue} onValueChange={setTabValue}>
          <TabsList className="mb-6 w-full justify-start overflow-x-auto">
            <TabsTrigger value="js" className="px-6 py-2.5 text-xs">JavaScript Snippet</TabsTrigger>
            <TabsTrigger value="wp" className="px-6 py-2.5 text-xs">WordPress Plugin</TabsTrigger>
          </TabsList>

          <TabsContent value="js" className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800">HTML Installation</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Copy the snippet below and paste it just before the closing <code>&lt;/head&gt;</code> tag on the page containing your forms.
            </p>
            <div className="relative group">
              <div className="absolute inset-0 bg-slate-900 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-slate-900 rounded-xl p-4 pr-16 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
                {jsSnippet}
                <button 
                  onClick={copyJs}
                  className="absolute right-2 top-2 bottom-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-colors border border-slate-700 shadow-sm"
                  title="Copy Code"
                >
                  {copiedJs ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wp" className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Download Plugin</h4>
                <p className="text-xs text-slate-500">Get the official LeadCop WordPress integration plugin zip file.</p>
              </div>
              <Button variant="outline" className="shrink-0 bg-white shadow-sm font-bold text-xs gap-2">
                <Download className="w-4 h-4" /> Download ZIP
              </Button>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-800">Setup Instructions</h4>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 leading-relaxed font-medium">
                <li>Upload and activate the plugin in your WordPress Admin.</li>
                <li>Navigate to <strong>Settings &gt; LeadCop</strong>.</li>
                <li>Paste your API Key below into the plugin settings.</li>
              </ol>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your API Key for WordPress</label>
              <div className="flex items-center gap-2">
                <div className="font-mono font-bold text-slate-900 bg-slate-50 p-2.5 px-4 border border-slate-200 rounded-lg text-xs flex-1 truncate">
                  {displayKey}
                </div>
                <Button onClick={copyWpKey} variant="outline" className="shadow-sm bg-white shrink-0">
                  {copiedWp ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Button 
        onClick={onNext}
        className="w-full h-12 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold rounded-xl transition-all shadow-sm group"
      >
        I have installed the script <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
      <p className="text-[10px] text-slate-400 font-medium text-center mt-4">
        You can always find your API keys and installation snippets in the Dashboard later.
      </p>
    </div>
  );
}
