"use server";

import { auth } from "@/lib/auth";
import { assignSubscriptionSchema, updateSubscriptionSchema } from "../schemas";
import { SubscriptionService, FeatureGateService } from "../services";
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
  await requireAdmin();
  return withActionHandler(assignSubscriptionSchema, input, async (data) => {
    return await SubscriptionService.assignOrUpdate(data);
  });
}

export async function updateSubscriptionAction(input: unknown) {
  await requireAdmin();
  return withActionHandler(updateSubscriptionSchema, input, async (data) => {
    return await SubscriptionService.updateSubscription(data);
  });
}

export async function adjustCreditsAction(input: unknown) {
  await requireAdmin();
  const schema = z.object({ userId: z.string().uuid(), amount: z.number().int() });
  return withActionHandler(schema, input, async (data) => {
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
