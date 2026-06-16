"use server";

import { auth } from "@/lib/auth";
import { createApiKeySchema, CreateApiKeyInput } from "../schemas";
import { ApiKeyService } from "../services";
import { ApiKeyRepository } from "../repository";
import { DomainRepository } from "@/features/domains/repository";

export async function createApiKeyAction(data: CreateApiKeyInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const parsed = createApiKeySchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const result = await ApiKeyService.createKey(session.user.id, parsed.data);
    return { success: true, data: result }; // Returns raw key once!
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function getDomainApiKeysAction(domainId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  
  // Verify domain ownership
  const domain = await DomainRepository.getDomainByIdAndUser(domainId, session.user.id);
  if (!domain) return { success: false, error: "Unauthorized" };

  const keys = await ApiKeyRepository.getKeysByDomain(domainId);
  return { success: true, data: keys };
}

export async function toggleApiKeyAction(data: { keyId: string; isActive: boolean }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const key = await ApiKeyRepository.getKeyWithDomain(data.keyId);
    if (!key || key.domain.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const updated = await ApiKeyRepository.toggleActive(data.keyId, data.isActive);
    return { success: true, data: updated };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function deleteApiKeyAction(data: { keyId: string }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const key = await ApiKeyRepository.getKeyWithDomain(data.keyId);
    if (!key || key.domain.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    await ApiKeyRepository.deleteKey(data.keyId);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}
