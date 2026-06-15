import { z } from "zod";

export const planBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  monthlyPrice: z.number().int().min(0, "Price must be positive"),
  yearlyPrice: z.number().int().min(0, "Price must be positive"),
  quotaLimit: z.number().int().min(-1), // -1 represents unlimited
  domainLimit: z.number().int().min(-1),
  roleDetection: z.boolean(),
  publicDetection: z.boolean(),
  customBlocklist: z.boolean(),
  bulkValidationLimit: z.number().int().min(-1),
  teamSeats: z.number().int().min(1),
});

export const createPlanSchema = planBaseSchema.extend({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase alphanumeric and dashes only"),
});

export const updatePlanSchema = planBaseSchema.extend({
  id: z.string().uuid("Invalid plan ID"),
  isActive: z.boolean().optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
