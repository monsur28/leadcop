import { prisma } from "@/lib/db";
import { ValidationStatus } from "@prisma/client";
import { AppError } from "@/lib/errors";

export class UsageRepository {
  /**
   * Atomically tracks a validation request, increments the counter, 
   * and creates the log entry while guaranteeing race-condition protection.
   */
  static async trackValidationAtomic(params: {
    userId: string;
    domainId: string;
    apiKeyId?: string | null;
    validatedDomain: string;
    status: ValidationStatus;
  }) {
    const month = new Date().getMonth() + 1; // 1-12
    const year = new Date().getFullYear();

    return await prisma.$transaction(async (tx: any) => {
      // 1. Fetch current subscription details within the transaction
      const sub = await tx.subscription.findUnique({
        where: { userId: params.userId },
        include: { plan: true },
      });

      if (!sub || sub.status !== "ACTIVE" || sub.currentPeriodEnd < new Date()) {
        throw new AppError("Active subscription required to perform validations.", 403);
      }

      // 2. Ensure UsageCounter exists for this specific month/year
      const counter = await tx.usageCounter.upsert({
        where: { userId_month_year: { userId: params.userId, month, year } },
        update: {},
        create: { userId: params.userId, month, year, usedValidations: 0 },
      });

      // 3. Calculate max allowed validations
      // Note: We use 2147483647 as safe max bounds for DB integer matching Unlimited
      const maxAllowed = sub.isUnlimited 
        ? 2147483647 
        : (sub.plan.quotaLimit + sub.extraCredits);

      // 4. Atomic Race-Condition Protected Increment
      // By using updateMany with a 'lt' constraint directly inside the database engine,
      // it is physically impossible for concurrent edge requests to bypass the quota.
      const incrementResult = await tx.usageCounter.updateMany({
        where: {
          id: counter.id,
          usedValidations: { lt: maxAllowed }
        },
        data: {
          usedValidations: { increment: 1 }
        }
      });

      // If count is 0, the database rejected the increment because it reached the limit.
      if (incrementResult.count === 0) {
        throw new AppError("Validation quota exceeded. Please upgrade your plan.", 402);
      }

      // 5. Insert the log entry securely now that quota is verified and decremented
      const log = await tx.validationLog.create({
        data: {
          domainId: params.domainId,
          apiKeyId: params.apiKeyId || null,
          validatedDomain: params.validatedDomain,
          status: params.status,
        }
      });

      return { 
        log, 
        currentUsage: counter.usedValidations + 1, 
        maxAllowed 
      };
    });
  }

  static async getValidationLogsBreakdown(userId: string) {
    const counts = await prisma.validationLog.groupBy({
      by: ["status"],
      where: {
        domain: {
          userId,
        },
      },
      _count: {
        _all: true,
      },
    });

    return counts.map((c: any) => ({
      status: c.status,
      count: c._count._all,
    }));
  }

  static async getDailyTrends(userId: string, daysLimit: number = 30) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - daysLimit);

    const logs = await prisma.validationLog.findMany({
      where: {
        domain: {
          userId,
        },
        createdAt: {
          gte: dateLimit,
        },
      },
      select: {
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group logs by date (YYYY-MM-DD)
    const trendsMap: Record<string, { total: number; blocked: number }> = {};
    for (const log of logs) {
      const dateStr = log.createdAt.toISOString().split("T")[0];
      if (!trendsMap[dateStr]) {
        trendsMap[dateStr] = { total: 0, blocked: 0 };
      }
      trendsMap[dateStr].total += 1;
      if (log.status !== "VALID") {
        trendsMap[dateStr].blocked += 1;
      }
    }

    return Object.entries(trendsMap).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  }

  static async getUserUsageSummary(userId: string) {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    const [sub, counter, domainsCount, activeKeysCount] = await Promise.all([
      prisma.subscription.findUnique({
        where: { userId },
        include: { plan: true },
      }),
      prisma.usageCounter.findUnique({
        where: { userId_month_year: { userId, month, year } },
      }),
      prisma.domain.count({ where: { userId } }),
      prisma.apiKey.count({
        where: { domain: { userId }, isActive: true },
      }),
    ]);

    return {
      subscription: sub,
      counter,
      domainsCount,
      activeKeysCount,
    };
  }

  static async getDashboardOverviewData(userId: string) {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    const [
      sub,
      counter,
      domainsCount,
      activeKeysCount,
      blockedCount,
      recentLogs,
      trends,
      recentDomains,
      recentKeys,
      totalValidationsCount
    ] = await Promise.all([
      prisma.subscription.findUnique({
        where: { userId },
        include: { plan: true },
      }),
      prisma.usageCounter.findUnique({
        where: { userId_month_year: { userId, month, year } },
      }),
      prisma.domain.count({ where: { userId } }),
      prisma.apiKey.count({
        where: { domain: { userId }, isActive: true },
      }),
      prisma.validationLog.count({
        where: { domain: { userId }, status: { not: "VALID" } },
      }),
      prisma.validationLog.findMany({
        where: { domain: { userId } },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { domain: true },
      }),
      this.getDailyTrends(userId, 90), // Fetch 90 days for the chart
      prisma.domain.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.apiKey.findMany({
        where: { domain: { userId } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { domain: true },
      }),
      prisma.validationLog.count({
        where: { domain: { userId } }
      })
    ]);

    return {
      subscription: sub,
      counter,
      domainsCount,
      activeKeysCount,
      blockedCount,
      recentLogs, // return the raw validation logs for the new UI component
      trends,
      totalValidationsCount
    };
  }

  static async getWebsiteDetailsUsageData(userId: string, domainId: string) {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    const [sub, counter, domainCount, recentLogs] = await Promise.all([
      prisma.subscription.findUnique({
        where: { userId },
        include: { plan: true },
      }),
      prisma.usageCounter.findUnique({
        where: { userId_month_year: { userId, month, year } },
      }),
      prisma.validationLog.count({
        where: {
          domainId,
          createdAt: {
            gte: new Date(year, month - 1, 1),
          }
        }
      }),
      prisma.validationLog.findMany({
        where: { domainId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { domain: true },
      })
    ]);

    return {
      subscription: sub,
      counter,
      domainValidationsThisMonth: domainCount,
      recentLogs
    };
  }
}
