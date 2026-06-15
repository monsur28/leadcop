import { z } from "zod";
import { SubscriptionStatus } from "@prisma/client";

export const assignSubscriptionSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  planId: z.string().uuid("Invalid plan ID"),
  status: z.nativeEnum(SubscriptionStatus).default("ACTIVE"),
  currentPeriodEnd: z.coerce.date(),
  extraCredits: z.number().int().min(0).default(0),
  isUnlimited: z.boolean().default(false),
});

export const updateSubscriptionSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  planId: z.string().uuid("Invalid plan ID").optional(),
  status: z.nativeEnum(SubscriptionStatus).optional(),
  currentPeriodEnd: z.coerce.date().optional(),
  extraCredits: z.number().int().optional(),
  isUnlimited: z.boolean().optional(),
});

export type AssignSubscriptionInput = z.infer<typeof assignSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
