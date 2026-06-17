"use client";

import { useState } from "react";
import { WebsiteApiAccess } from "./website-api-access";
import { WebsiteInstallationTabs } from "./website-installation-tabs";
import { WebsiteUsageSummary } from "./website-usage-summary";

interface WebsiteIntegrationControlsProps {
  domainId: string;
  apiKey: {
    prefix: string;
    createdAt: Date;
  } | null;
  validationsThisMonth: number;
  totalQuota: number;
  isUnlimited: boolean;
}

export function WebsiteIntegrationControls({
  domainId,
  apiKey,
  validationsThisMonth,
  totalQuota,
  isUnlimited
}: WebsiteIntegrationControlsProps) {
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const apiKeyHint = generatedKey || (apiKey ? `${apiKey.prefix}••••` : "YOUR_API_KEY");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6 flex flex-col">
        <WebsiteApiAccess 
          domainId={domainId} 
          apiKey={apiKey} 
          onKeyGenerated={(newKey) => setGeneratedKey(newKey)} 
        />
        <WebsiteUsageSummary 
          validationsThisMonth={validationsThisMonth}
          totalQuota={totalQuota}
          isUnlimited={isUnlimited}
        />
      </div>

      {/* Right Column */}
      <div className="flex flex-col h-full">
        <WebsiteInstallationTabs apiKeyHint={apiKeyHint} />
      </div>
    </div>
  );
}
