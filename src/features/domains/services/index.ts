import { DomainRepository } from "../repository";
import { CreateDomainInput, UpdateDomainInput } from "../schemas";
import { ValidationError, AppError } from "@/lib/errors";
import { FeatureGateService } from "@/features/subscriptions/services";
import crypto from "crypto";
import dns from "dns/promises";

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

    const verificationToken = crypto.randomUUID();
    return await DomainRepository.createDomain(userId, input.hostname, verificationToken);
  }

  static async updateDomain(userId: string, input: UpdateDomainInput) {
    const domain = await DomainRepository.getDomainByIdAndUser(input.domainId, userId);
    if (!domain) throw new AppError("Domain not found", 404);

    if (domain.hostname === input.hostname) return domain;

    const existing = await DomainRepository.findByHostname(userId, input.hostname);
    if (existing) {
      throw new ValidationError("Domain already registered to your account.");
    }

    const verificationToken = crypto.randomUUID();
    return await DomainRepository.updateDomain(input.domainId, input.hostname, verificationToken);
  }

  static async deleteDomain(userId: string, domainId: string) {
    const domain = await DomainRepository.getDomainByIdAndUser(domainId, userId);
    if (!domain) throw new AppError("Domain not found", 404);

    return await DomainRepository.deleteDomain(domainId);
  }

  static async verifyDomainOwnership(domainId: string, userId: string) {
    const domain = await DomainRepository.getDomainByIdAndUser(domainId, userId);
    if (!domain) throw new AppError("Domain not found", 404);
    if (domain.isVerified) return domain;
    if (!domain.verificationToken) throw new AppError("No verification token found", 400);

    const token = domain.verificationToken;
    let isVerified = false;

    // Method 1: DNS TXT Check
    try {
      const txtRecords = await dns.resolveTxt(domain.hostname);
      for (const record of txtRecords) {
        if (record.join('').includes(`leadcop-verification=${token}`)) {
          isVerified = true;
          break;
        }
      }
    } catch (error) {
      // Fallback to HTTP check
    }

    // Method 2: HTTP Meta Tag Check
    if (!isVerified) {
      try {
        const response = await fetch(`https://${domain.hostname}`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000) 
        });
        if (response.ok) {
          const html = await response.text();
          if (html.includes(`name="leadcop-verification"`) && html.includes(`content="${token}"`)) {
            isVerified = true;
          }
        }
      } catch (error) {
        // HTTP failure
      }
    }

    if (isVerified) {
      return await DomainRepository.verifyDomain(domain.id);
    }

    throw new ValidationError("Verification failed. DNS TXT record or HTML Meta tag not found.");
  }

  static async toggleDomainState(domainId: string, userId: string, isActive: boolean) {
    const domain = await DomainRepository.getDomainByIdAndUser(domainId, userId);
    if (!domain) throw new AppError("Domain not found", 404);

    return await DomainRepository.toggleActive(domainId, isActive);
  }
}
