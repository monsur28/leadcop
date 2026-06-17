import { DomainRepository } from "../repository";
import { CreateDomainInput, UpdateDomainInput } from "../schemas";
import { ValidationError, AppError } from "@/lib/errors";
import { FeatureGateService } from "@/features/subscriptions/services";
import { ApiKeyService } from "@/features/api-keys/services";

export class DomainService {
  static async addDomain(userId: string, input: CreateDomainInput) {
    const existing = await DomainRepository.findByHostname(userId, input.hostname);
    if (existing) {
      throw new ValidationError("Domain already registered to your account.");
    }

    const limits = await FeatureGateService.getAccessLimits(userId);
    if (!limits) {
      throw new AppError("Active subscription required to add domains", 403);
    }

    if (!limits.isUnlimited && limits.domainLimit !== -1) {
      const currentCount = await DomainRepository.countUserDomains(userId);
      if (currentCount >= limits.domainLimit) {
        throw new ValidationError(`Domain limit of ${limits.domainLimit} reached. Please upgrade your plan.`);
      }
    }

    const domain = await DomainRepository.createDomain(userId, input.hostname);
    
    // Generate the 1 associated API Key automatically
    const keyResult = await ApiKeyService.createKey(userId, {
      domainId: domain.id,
      name: "Primary Key",
      type: "PUBLIC"
    });

    return { domain, rawKey: keyResult.rawKey };
  }

  static async updateDomain(userId: string, input: UpdateDomainInput) {
    const domain = await DomainRepository.getDomainByIdAndUser(input.domainId, userId);
    if (!domain) throw new AppError("Domain not found", 404);

    if (domain.hostname === input.hostname) return domain;

    const existing = await DomainRepository.findByHostname(userId, input.hostname);
    if (existing) {
      throw new ValidationError("Domain already registered to your account.");
    }

    return await DomainRepository.updateDomain(input.domainId, input.hostname);
  }

  static async deleteDomain(userId: string, domainId: string) {
    const domain = await DomainRepository.getDomainByIdAndUser(domainId, userId);
    if (!domain) throw new AppError("Domain not found", 404);

    return await DomainRepository.deleteDomain(domainId);
  }


  static async toggleDomainState(domainId: string, userId: string, isActive: boolean) {
    const domain = await DomainRepository.getDomainByIdAndUser(domainId, userId);
    if (!domain) throw new AppError("Domain not found", 404);

    return await DomainRepository.toggleActive(domainId, isActive);
  }

  static async getDomainDetails(userId: string, domainId: string) {
    const domain = await DomainRepository.getDomainByIdAndUser(domainId, userId);
    if (!domain) throw new AppError("Domain not found", 404);
    
    // We can fetch the API Key directly using Prisma if not in DomainRepository
    // Assuming ApiKeyRepository has a method to get by domainId
    const { ApiKeyRepository } = await import("@/features/api-keys/repository");
    const keys = await ApiKeyRepository.getKeysByDomain(domainId);
    
    return { domain, apiKey: keys[0] || null };
  }

  static async regenerateApiKey(userId: string, domainId: string) {
    const domain = await DomainRepository.getDomainByIdAndUser(domainId, userId);
    if (!domain) throw new AppError("Domain not found", 404);

    const { ApiKeyRepository } = await import("@/features/api-keys/repository");
    const keys = await ApiKeyRepository.getKeysByDomain(domainId);
    
    if (keys[0]) {
      await ApiKeyRepository.deleteKey(keys[0].id);
    }

    const keyResult = await ApiKeyService.createKey(userId, {
      domainId: domain.id,
      name: "Primary Key",
      type: "PUBLIC"
    });

    return { rawKey: keyResult.rawKey };
  }
}
