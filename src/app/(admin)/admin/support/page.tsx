import * as React from "react";
import { HelpCircle, Mail, ExternalLink, MessageSquare, BookOpen, Shield } from "lucide-react";

const SUPPORT_CHANNELS = [
  {
    icon: Mail,
    title: "Support Email",
    description: "Primary inbound channel for customer inquiries and account recovery.",
    value: "support@leadcop.co",
    action: "mailto:support@leadcop.co",
    actionLabel: "Send Email",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
  },
  {
    icon: MessageSquare,
    title: "Live Chat Widget",
    description: "Real-time support conversations embedded in the dashboard for premium tier users.",
    value: "Crisp / Intercom",
    action: null,
    actionLabel: "Configure",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Self-serve documentation covering API integration, domain verification, and billing FAQs.",
    value: "docs.leadcop.co",
    action: "https://docs.leadcop.co",
    actionLabel: "Open Docs",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-100",
  },
  {
    icon: Shield,
    title: "Security Reports",
    description: "Dedicated channel for vulnerability disclosures, abuse reports, and compliance inquiries.",
    value: "security@leadcop.co",
    action: "mailto:security@leadcop.co",
    actionLabel: "Send Report",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-100",
  },
];

const SLA_TIERS = [
  { tier: "Free", responseTime: "72 hours", channels: "Email only", priority: "Low" },
  { tier: "Growth", responseTime: "24 hours", channels: "Email + Chat", priority: "Normal" },
  { tier: "Business", responseTime: "4 hours", channels: "Email + Chat + Priority", priority: "High" },
  { tier: "Enterprise", responseTime: "1 hour", channels: "All + Dedicated CSM", priority: "Critical" },
];

export default function AdminSupportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Support Configuration</h2>
          <p className="text-xs text-slate-500 font-medium">Manage support channels, response SLAs, and customer communication settings.</p>
        </div>
      </div>

      {/* Support Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SUPPORT_CHANNELS.map((channel) => (
          <div
            key={channel.title}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl ${channel.bgColor} ${channel.color} flex items-center justify-center shrink-0 border ${channel.borderColor}`}>
                <channel.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900 mb-0.5">{channel.title}</h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-2">{channel.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{channel.value}</span>
                  {channel.action ? (
                    <a
                      href={channel.action}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-[#FF7A00] hover:text-[#E56E00] flex items-center gap-1 transition-colors"
                    >
                      {channel.actionLabel} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      {channel.actionLabel} <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SLA Response Tiers */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Response SLA by Plan Tier</h3>
          <p className="text-[11px] text-slate-500 font-medium">Target response times and available channels based on customer subscription.</p>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3">Plan Tier</th>
              <th className="px-6 py-3">Response Time</th>
              <th className="px-6 py-3">Channels</th>
              <th className="px-6 py-3">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {SLA_TIERS.map((sla) => (
              <tr key={sla.tier} className="hover:bg-slate-50/20 transition-colors">
                <td className="px-6 py-3.5 font-bold text-slate-900">{sla.tier}</td>
                <td className="px-6 py-3.5 font-mono text-slate-600">{sla.responseTime}</td>
                <td className="px-6 py-3.5 text-slate-600 font-medium">{sla.channels}</td>
                <td className="px-6 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border ${
                    sla.priority === "Critical"
                      ? "bg-red-50 text-red-700 border-red-100"
                      : sla.priority === "High"
                        ? "bg-orange-50 text-orange-700 border-orange-100"
                        : sla.priority === "Normal"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}>
                    {sla.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Coming Soon Ticket System Notice */}
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-100">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">Ticket System Coming Soon</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          A built-in support ticket system with status tracking, priority labels, and threaded replies is planned for a future release.
          Currently, all support is managed through external channels listed above.
        </p>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
