import { getDashboardOverviewAction } from "@/features/usage/actions";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { ValidationChart } from "@/components/dashboard/validation-chart";
import { OnboardingProgress } from "@/components/dashboard/onboarding-progress";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const res = await getDashboardOverviewAction();
  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center text-red-500 font-semibold bg-red-50 border border-red-200 rounded-2xl">
        Failed to load dashboard overview. Please check your credentials and try again.
      </div>
    );
  }

  const {
    subscription,
    counter,
    domainsCount,
    activeKeysCount,
    blockedCount,
    timeline,
    trends
  } = res.data;

  const planName = subscription?.plan?.name || "Free Sandbox";
  const quotaLimit = subscription ? (subscription.plan.quotaLimit + subscription.extraCredits) : 1000;
  const isUnlimited = subscription?.isUnlimited || false;
  const validationsUsed = counter?.usedValidations || 0;

  // Has onboarded means they have installed the script and started sending validations
  const scriptInstalled = timeline.some((t: any) => t.type === 'VALIDATION_PASSED' || t.type === 'VALIDATION_BLOCKED');
  const hasOnboarded = activeKeysCount > 0 && scriptInstalled;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <WelcomeBanner 
        userName={session.user.name || "User"}
        planName={planName}
        quotaLimit={quotaLimit}
        validationsUsed={validationsUsed}
        isUnlimited={isUnlimited}
      />

      <KPICards 
        validationsUsed={validationsUsed}
        quotaLimit={quotaLimit}
        isUnlimited={isUnlimited}
        domainsCount={domainsCount}
        activeKeysCount={activeKeysCount}
        blockedCount={blockedCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ValidationChart data={trends} />
        </div>
        
        <div className="flex flex-col gap-6 h-full">
          {!hasOnboarded && (
            <OnboardingProgress 
              domainAdded={domainsCount > 0}
              keyGenerated={activeKeysCount > 0}
              scriptInstalled={scriptInstalled}
            />
          )}
          <ActivityTimeline feed={timeline} />
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
