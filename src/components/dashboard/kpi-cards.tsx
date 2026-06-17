"use client";

import { Activity, ShieldCheck, Globe, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/system/cards";
import { Icon } from "@/components/system/icons";

interface KPICardsProps {
  validationsUsed: number;
  quotaLimit: number;
  isUnlimited: boolean;
  domainsCount: number;
  blockedCount: number;
}

export function KPICards({ validationsUsed, quotaLimit, isUnlimited, domainsCount, blockedCount }: KPICardsProps) {
  const usagePercentage = isUnlimited ? 0 : Math.round((validationsUsed / quotaLimit) * 100);

  const cards = [
    {
      title: "Validations This Month",
      value: validationsUsed.toLocaleString(),
      sub: isUnlimited ? "Unlimited Quota" : `${usagePercentage}% of limit`,
      icon: <Icon icon={Activity} sizeVariant="sm" />,
      accent: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Blocked Leads",
      value: blockedCount.toLocaleString(),
      sub: "Disposable & invalid",
      icon: <Icon icon={ShieldCheck} sizeVariant="sm" />,
      accent: "text-danger",
      bg: "bg-danger/10",
    },
    {
      title: "Protected Websites",
      value: domainsCount.toLocaleString(),
      sub: "Active domains",
      icon: <Icon icon={Globe} sizeVariant="sm" />,
      accent: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Quota Usage",
      value: isUnlimited ? "0%" : `${usagePercentage}%`,
      sub: "Capacity remaining",
      icon: <Icon icon={TrendingUp} sizeVariant="sm" />,
      accent: "text-indigo-600",
      bg: "bg-indigo-50",
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <KpiCard
          key={idx}
          title={card.title}
          value={card.value}
          subtitle={card.sub}
          icon={card.icon}
          iconColorClass={card.accent}
          iconBgClass={card.bg}
          className="h-[130px]" // preserving height for consistency
        />
      ))}
    </div>
  );
}
