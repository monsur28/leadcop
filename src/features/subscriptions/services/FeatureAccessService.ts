import { Subscription, Plan } from "@prisma/client";

export type ResolvedLimits = {
  features: {
    roleDetection: boolean;
    publicDetection: boolean;
    customBlocklist: boolean;
  };
  limits: {
    quota: number;
    rateLimitPerMinute: number;
    domains: number;
    teamSeats: number;
    bulkValidation: number;
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
        customBlocklist: false,
      },
      limits: {
        quota: 0,
        rateLimitPerMinute: 10, // 10 RPM for unauthenticated / unauthorized requests
        domains: 0,
        teamSeats: 0,
        bulkValidation: 0,
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
        customBlocklist: plan.customBlocklist,
      },
      limits: {
        quota: FeatureAccessService.resolveLimit(subscription.customQuotaLimit, plan.quotaLimit),
        rateLimitPerMinute: FeatureAccessService.resolveLimit(subscription.customRateLimit, plan.rateLimitPerMinute),
        domains: FeatureAccessService.resolveLimit(subscription.customDomainLimit, plan.domainLimit),
        teamSeats: FeatureAccessService.resolveLimit(subscription.customTeamSeats, plan.teamSeats),
        bulkValidation: FeatureAccessService.resolveLimit(subscription.customBulkValidationLimit, plan.bulkValidationLimit),
      },
    };
  }
}
