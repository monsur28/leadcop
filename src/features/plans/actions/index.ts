"use server";

import { auth } from "@/lib/auth";
import { createPlanSchema, updatePlanSchema } from "../schemas";
import { PlanService } from "../services";
import { PlanRepository } from "../repository";
import { withActionHandler } from "@/lib/action-handler";
import { UnauthorizedError } from "@/lib/errors";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as any)?.globalRole !== "ADMIN") {
    throw new UnauthorizedError("Admin access required");
  }
}

export async function createPlanAction(input: unknown) {
  await requireAdmin();
  return withActionHandler(createPlanSchema, input, async (data) => {
    return await PlanService.createPlan(data);
  });
}

export async function updatePlanAction(input: unknown) {
  await requireAdmin();
  return withActionHandler(updatePlanSchema, input, async (data) => {
    return await PlanService.updatePlan(data);
  });
}

export async function togglePlanAction(input: unknown) {
  await requireAdmin();
  const schema = z.object({ id: z.string().uuid(), isActive: z.boolean() });
  return withActionHandler(schema, input, async (data) => {
    return await PlanService.togglePlanStatus(data.id, data.isActive);
  });
}

export async function getPlansAction(includeInactive: boolean = false) {
  // Publicly accessible action (e.g., for public pricing page rendering)
  try {
    const plans = await PlanRepository.getAllPlans(includeInactive);
    return { success: true, data: plans };
  } catch (error) {
    return { success: false, error: "Failed to fetch plans" };
  }
}
