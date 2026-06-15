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

    return await prisma.$transaction(async (tx) => {
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
}
