"use server";

import { auth } from "@/lib/auth";
import { createDomainSchema, updateDomainSchema } from "../schemas";
import { DomainService } from "../services";
import { DomainRepository } from "../repository";
import { withActionHandler } from "@/lib/action-handler";
import { UnauthorizedError } from "@/lib/errors";
import { z } from "zod";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError("Authentication required");
  return session.user.id;
}

export async function addDomainAction(input: unknown) {
  const userId = await requireUser();
  return withActionHandler(createDomainSchema, input, async (data: any) => {
    return await DomainService.addDomain(userId, data);
  });
}

export async function updateDomainAction(input: unknown) {
  const userId = await requireUser();
  return withActionHandler(updateDomainSchema, input, async (data: any) => {
    return await DomainService.updateDomain(userId, data);
  });
}

export async function deleteDomainAction(input: unknown) {
  const userId = await requireUser();
  const schema = z.object({ domainId: z.string() });
  return withActionHandler(schema, input, async (data: any) => {
    return await DomainService.deleteDomain(userId, data.domainId);
  });
}



export async function toggleDomainAction(input: unknown) {
  const userId = await requireUser();
  const schema = z.object({ domainId: z.string(), isActive: z.boolean() });
  return withActionHandler(schema, input, async (data: any) => {
    return await DomainService.toggleDomainState(data.domainId, userId, data.isActive);
  });
}

export async function getUserDomainsAction() {
  try {
    const userId = await requireUser();
    const domains = await DomainRepository.getUserDomains(userId);
    return { success: true, data: domains };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function getDomainDetailsAction(domainId: string) {
  try {
    const userId = await requireUser();
    const details = await DomainService.getDomainDetails(userId, domainId);
    return { success: true, data: details };
  } catch (error: any) {
    return { success: false, error: error.message || "An error occurred" };
  }
}

export async function regenerateApiKeyAction(domainId: string) {
  try {
    const userId = await requireUser();
    const result = await DomainService.regenerateApiKey(userId, domainId);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "An error occurred" };
  }
}

export async function getWebsiteDetailsPageDataAction(domainId: string) {
  try {
    const userId = await requireUser();
    const [domainDetails, usageData] = await Promise.all([
      DomainService.getDomainDetails(userId, domainId),
      import("@/features/usage/repository").then(m => m.UsageRepository.getWebsiteDetailsUsageData(userId, domainId))
    ]);
    return { success: true, data: { ...domainDetails, ...usageData } };
  } catch (error: any) {
    return { success: false, error: error.message || "An error occurred" };
  }
}
