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
  if (session?.user?.globalRole !== "ADMIN") {
    throw new UnauthorizedError("Admin access required");
  }
}

export async function createPlanAction(input: unknown) {
  await requireAdmin();
  return withActionHandler(createPlanSchema, input, async (data: any) => {
    await requireAdmin();
    return await PlanService.createPlan(data);
  });
}

export async function updatePlanAction(input: unknown) {
  return withActionHandler(updatePlanSchema, input, async (data: any) => {
    await requireAdmin();
    return await PlanService.updatePlan(data);
  });
}

export async function togglePlanAction(input: unknown) {
  const schema = z.object({ id: z.string(), isActive: z.boolean() });
  return withActionHandler(schema, input, async (data: any) => {
    return await PlanService.togglePlanStatus(data.id, data.isActive);
  });
}

export async function getPlansAction(includeInactive: boolean = false) {
  // Publicly accessible action (e.g., for public pricing page rendering)
  try {
    let plans = await PlanRepository.getAllPlans(includeInactive);
    
    if (plans.length === 0) {
      // Auto-seed a free plan so new installations aren't stuck
      const freePlan = await PlanRepository.createPlan({
        name: "Free Sandbox",
        slug: "free-sandbox",
        monthlyPrice: 0,
        yearlyPrice: 0,
        quotaLimit: 1000,
        domainLimit: 1,
        bulkValidationLimit: 100,
        teamSeats: 1,
        roleDetection: false,
        publicDetection: true,
        customBlocklist: false,

      });
      plans = [freePlan];
    }
    
    return { success: true, data: plans };
  } catch {
    return { success: false, error: "Failed to fetch plans" };
  }
}
