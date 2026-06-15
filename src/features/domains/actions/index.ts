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
  return withActionHandler(createDomainSchema, input, async (data) => {
    return await DomainService.addDomain(userId, data);
  });
}

export async function updateDomainAction(input: unknown) {
  const userId = await requireUser();
  return withActionHandler(updateDomainSchema, input, async (data) => {
    return await DomainService.updateDomain(userId, data);
  });
}

export async function deleteDomainAction(input: unknown) {
  const userId = await requireUser();
  const schema = z.object({ domainId: z.string().uuid() });
  return withActionHandler(schema, input, async (data) => {
    return await DomainService.deleteDomain(userId, data.domainId);
  });
}

export async function verifyDomainAction(input: unknown) {
  const userId = await requireUser();
  const schema = z.object({ domainId: z.string().uuid() });
  return withActionHandler(schema, input, async (data) => {
    return await DomainService.verifyDomainOwnership(data.domainId, userId);
  });
}

export async function toggleDomainAction(input: unknown) {
  const userId = await requireUser();
  const schema = z.object({ domainId: z.string().uuid(), isActive: z.boolean() });
  return withActionHandler(schema, input, async (data) => {
    return await DomainService.toggleDomainState(data.domainId, userId, data.isActive);
  });
}

export async function getUserDomainsAction() {
  try {
    const userId = await requireUser();
    const domains = await DomainRepository.getUserDomains(userId);
    return { success: true, data: domains };
  } catch (error) {
    return { success: false, error: "Unauthorized" };
  }
}
