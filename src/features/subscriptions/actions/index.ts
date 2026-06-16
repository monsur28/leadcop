"use server";

import { auth } from "@/lib/auth";
import { assignSubscriptionSchema, updateSubscriptionSchema } from "../schemas";
import { SubscriptionService, FeatureGateService } from "../services";
import { SubscriptionRepository } from "../repository";
import { withActionHandler } from "@/lib/action-handler";
import { UnauthorizedError } from "@/lib/errors";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.globalRole !== "ADMIN") {
    throw new UnauthorizedError("Admin access required");
  }
}

// ------------------------------------------------------------------
// ADMIN ACTIONS
// ------------------------------------------------------------------

export async function assignSubscriptionAction(input: unknown) {
  return withActionHandler(assignSubscriptionSchema, input, async (data: any) => {
    await requireAdmin();
    return await SubscriptionService.assignOrUpdate(data);
  });
}

export async function updateSubscriptionAction(input: unknown) {
  return withActionHandler(updateSubscriptionSchema, input, async (data: any) => {
    await requireAdmin();
    return await SubscriptionService.updateSubscription(data);
  });
}

export async function processCreditsAction(input: unknown) {
  const schema = z.object({ userId: z.string(), amount: z.number() });
  return withActionHandler(schema, input, async (data: any) => {
    await requireAdmin();
    if (data.amount > 0) {
      return await SubscriptionService.addBonusCredits(data.userId, data.amount);
    } else {
      return await SubscriptionService.removeBonusCredits(data.userId, data.amount);
    }
  });
}

// ------------------------------------------------------------------
// USER ACTIONS
// ------------------------------------------------------------------

export async function getMyLimitsAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  
  try {
    const limits = await FeatureGateService.getAccessLimits(session.user.id);
    return { success: true, data: limits };
  } catch {
    return { success: false, error: "Failed to fetch access limits" };
  }
}

export async function createUpgradeRequestAction(planId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    // Check if there is already a pending request
    const existing = await SubscriptionRepository.getPendingUpgradeRequest(session.user.id);
    if (existing) {
      return { success: false, error: "You already have a pending upgrade request." };
    }

    const request = await SubscriptionRepository.createUpgradeRequest(session.user.id, planId);
    return { success: true, data: request };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function getPendingUpgradeRequestAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const existing = await SubscriptionRepository.getPendingUpgradeRequest(session.user.id);
    return { success: true, data: existing };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function selectPlanDuringOnboardingAction(planId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const { PlanRepository } = await import("@/features/plans/repository");
    const plan = await PlanRepository.getPlanById(planId);
    if (!plan) return { success: false, error: "Plan not found" };

    const plans = await PlanRepository.getAllPlans();
    const freePlan = plans.find((p: any) => p.monthlyPrice === 0) || plan;

    if (plan.monthlyPrice > 0) {
      // Assign Free plan so they aren't blocked, and request upgrade
      await SubscriptionService.assignOrUpdate({
        userId: session.user.id,
        planId: freePlan.id,
        status: "ACTIVE",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        extraCredits: 0,
        isUnlimited: false,
      });

      const existing = await SubscriptionRepository.getPendingUpgradeRequest(session.user.id);
      if (!existing) {
        await SubscriptionRepository.createUpgradeRequest(session.user.id, plan.id);
      }
    } else {
      // Directly assign Free plan
      await SubscriptionService.assignOrUpdate({
        userId: session.user.id,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        extraCredits: 0,
        isUnlimited: false,
      });
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}
