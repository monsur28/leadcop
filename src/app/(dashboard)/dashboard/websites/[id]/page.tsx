import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, PowerOff } from "lucide-react";
import { getWebsiteDetailsPageDataAction } from "@/features/domains/actions";
import { WebsiteDetailsClient } from "@/components/websites/website-details-client";

export default async function WebsiteDetailsPage({ params }: { params: { id: string } }) {
  const res = await getWebsiteDetailsPageDataAction(params.id);

  if (!res.success || !res.data) {
    return notFound();
  }

  const {
    domain,
    apiKey,
    subscription,
    domainValidationsThisMonth,
    recentLogs
  } = res.data;

  return (
    <WebsiteDetailsClient 
      domain={domain}
      apiKey={apiKey}
      subscription={subscription}
      domainValidationsThisMonth={domainValidationsThisMonth}
      recentLogs={recentLogs}
    />
  );
}

export const dynamic = "force-dynamic";
