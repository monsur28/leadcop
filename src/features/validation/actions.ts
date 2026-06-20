"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ValidationMessageService } from "./services/messages";
import { ValidationMessageType } from "@prisma/client";
import { auth } from "@/lib/auth";

const saveMessageSchema = z.object({
  messageType: z.nativeEnum(ValidationMessageType),
  message: z.string().min(1, "Message is required"),
  isEnabled: z.boolean().default(true),
  websiteId: z.string().optional()
});

export async function saveValidationMessage(formData: z.infer<typeof saveMessageSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = saveMessageSchema.parse(formData);

  await ValidationMessageService.updateMessage(
    session.user.id,
    parsed.messageType,
    parsed.message,
    parsed.isEnabled,
    parsed.websiteId
  );

  revalidatePath("/dashboard/validation-messages");
  return { success: true };
}

const resetSchema = z.object({
  messageType: z.nativeEnum(ValidationMessageType),
  websiteId: z.string().optional()
});

export async function resetValidationMessage(formData: z.infer<typeof resetSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = resetSchema.parse(formData);

  await ValidationMessageService.resetToDefault(
    session.user.id,
    parsed.messageType,
    parsed.websiteId
  );

  revalidatePath("/dashboard/validation-messages");
  return { success: true };
}
