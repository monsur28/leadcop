import { Subscription, Plan } from "@prisma/client";

export type ResolvedLimits = {
  features: {
    roleDetection: boolean;
    publicDetection: boolean;
    allowRoleOverrides?: boolean;
    allowCustomRoles?: boolean;
    allowWebsiteLevelRoles?: boolean;
  };
  limits: {
    quota: number;
    rateLimitPerMinute: number;
    domains: number;
    apiKeys: number;
  };
};

export class FeatureAccessService {
  /**
   * Generates the default unauthenticated or free limits.
   * If an unauthenticated user hits the API, these are the limits they inherit.
   */
  static defaultLimits(): ResolvedLimits {
    return {
      features: {
        roleDetection: false,
        publicDetection: false,
        allowRoleOverrides: false,
        allowCustomRoles: false,
        allowWebsiteLevelRoles: false,
      },
      limits: {
        quota: 0,
        rateLimitPerMinute: 10, // 10 RPM for unauthenticated / unauthorized requests
        domains: 0,
        apiKeys: 0,
      },
    };
  }

  /**
   * Helper function to cascade overrides over base limits.
   */
  private static resolveLimit(override: number | null, base: number): number {
    return override !== null ? override : base;
  }

  /**
   * Evaluates the active subscription, plan, and any admin-applied user overrides
   * to calculate the final resolved limits for a given user.
   */
  static async evaluate(userId: string, db: any): Promise<ResolvedLimits | null> {
    const subscription = await db.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription || subscription.status !== "ACTIVE") {
      return null;
    }

    const { plan } = subscription;

    return {
      features: {
        roleDetection: plan.roleDetection,
        publicDetection: plan.publicDetection,
        allowRoleOverrides: plan.allowRoleOverrides,
        allowCustomRoles: plan.allowCustomRoles,
        allowWebsiteLevelRoles: plan.allowWebsiteLevelRoles,
      },
      limits: {
        quota: FeatureAccessService.resolveLimit(subscription.customQuotaLimit, plan.quotaLimit),
        rateLimitPerMinute: FeatureAccessService.resolveLimit(subscription.customRateLimit, plan.rateLimitPerMinute),
        domains: FeatureAccessService.resolveLimit(subscription.customDomainLimit, plan.domainLimit),
        apiKeys: FeatureAccessService.resolveLimit(subscription.customApiKeyLimit, plan.apiKeyLimit),
      },
    };
  }
}
