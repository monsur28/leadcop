import { ValidationResponse, ValidationOptions } from "../types";
import { Redis } from "@upstash/redis";
import { FALLBACK_ROLES, FALLBACK_PUBLIC_PROVIDERS } from "@/constants/domain-intelligence";

const redis = Redis.fromEnv();

export class SyntaxService {
  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export class TldValidationService {
  static async isValid(domain: string): Promise<boolean> {
    const parts = domain.split('.');
    const tld = parts[parts.length - 1].toLowerCase();
    
    // Quick length check for obvious invalid domains
    if (tld.length < 2) return false;

    // Check Redis dynamic list
    try {
      const isMember = await redis.sismember("domains:tld", tld);
      if (isMember) return true;
      
      // Fallback: If Redis is completely empty (never synced), allow standard length TLDs to prevent blocking everything
      const count = await redis.scard("domains:tld");
      if (count === 0 && tld.length >= 2 && tld.length <= 6) return true;
    } catch (err) {
      // Failover: Never break validation if Redis is down
      console.error("[TLD Failover]", err);
      if (tld.length >= 2 && tld.length <= 6) return true;
    }
    
    return false;
  }
}

export class DisposableService {
  static async isDisposable(domain: string): Promise<boolean> {
    try {
      return (await redis.sismember("domains:disposable", domain.toLowerCase())) === 1;
    } catch (err) {
      console.error("[Disposable Failover]", err);
      return false; // Fail open
    }
  }
}

import { prisma } from "@/lib/db";

export class RoleDetectionService {
  static async isRoleAccount(localPart: string, options: ValidationOptions): Promise<{ isRole: boolean; matchedRole: string | null }> {
    const roleToMatch = localPart.toLowerCase();

    // 1. Custom Roles Check
    if (options.allowCustomRoles && options.userId) {
      const customRole = await prisma.customRoleAddress.findFirst({
        where: {
          userId: options.userId,
          name: roleToMatch,
          ...(options.allowWebsiteLevelRoles && options.websiteId ? {
            OR: [
              { websiteId: options.websiteId },
              { websiteId: null }
            ]
          } : {
            websiteId: null
          })
        }
      });
      if (customRole) {
        return { isRole: true, matchedRole: roleToMatch };
      }
    }

    // 2. System Roles Check
    let isSystemRole = false;
    try {
      isSystemRole = (await redis.sismember("domains:role", roleToMatch)) === 1;
    } catch (err) {
      // Failover list if Redis is down
      const failoverRoles = new Set(FALLBACK_ROLES);
      isSystemRole = failoverRoles.has(roleToMatch);
    }

    if (!isSystemRole) {
      return { isRole: false, matchedRole: null };
    }

    // 3. System Role Allowlist Overrides Check
    if (options.allowRoleOverrides && options.userId) {
      const roleAddress = await prisma.roleAddress.findUnique({ where: { name: roleToMatch } });
      if (roleAddress) {
        const override = await prisma.websiteRoleRule.findFirst({
          where: {
            userId: options.userId,
            roleAddressId: roleAddress.id,
            ...(options.allowWebsiteLevelRoles && options.websiteId ? {
              OR: [
                { websiteId: options.websiteId },
                { websiteId: null }
              ]
            } : {
              websiteId: null
            })
          },
          orderBy: { websiteId: 'asc' } // Prioritize website-level override if both exist
        });

        // If explicitly un-blocked (allowed)
        if (override && override.isBlocked === false) {
          return { isRole: false, matchedRole: null };
        }
      }
    }

    return { isRole: true, matchedRole: roleToMatch };
  }
}

export class PublicEmailService {
  static async isPublicProvider(domain: string): Promise<boolean> {
    try {
      return (await redis.sismember("domains:public", domain.toLowerCase())) === 1;
    } catch (err) {
      console.error("[PublicEmail Failover]", err);
      return false;
    }
  }

  static async getProviders(): Promise<string[]> {
    try {
      return await redis.smembers("domains:public");
    } catch (err) {
      return FALLBACK_PUBLIC_PROVIDERS; // Emergency fallback
    }
  }
}

export class TypoDetectionService {
  static getLevenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            Math.min(matrix[i][j - 1] + 1, // insertion
                     matrix[i - 1][j] + 1) // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  static async detectTypo(domain: string): Promise<string | null> {
    if (await PublicEmailService.isPublicProvider(domain)) return null;

    let closestMatch = null;
    let minDistance = 2; // Max distance for typo consideration

    const providers = await PublicEmailService.getProviders();

    for (const provider of providers) {
      const distance = this.getLevenshteinDistance(domain, provider);
      if (distance <= minDistance && distance > 0) {
        minDistance = distance;
        closestMatch = provider;
      }
    }

    return closestMatch;
  }
}

export class ValidationPipelineService {
  static async validateEmail(email: string, options: ValidationOptions): Promise<ValidationResponse> {
    try {
      // Step 1: Syntax Validation
      if (!SyntaxService.isValid(email)) {
        return { valid: false, type: "INVALID_SYNTAX", suggestion: null };
      }

      const [localPart, domain] = email.split('@').map(s => s.toLowerCase());

      // Step 2: TLD Validation (Now Async)
      if (!(await TldValidationService.isValid(domain))) {
        return { valid: false, type: "INVALID_DOMAIN", suggestion: null };
      }

      // Step 3: Disposable Detection
      if (await DisposableService.isDisposable(domain)) {
        return { valid: false, type: "DISPOSABLE_EMAIL", suggestion: null };
      }

      let featureAvailable = true;

      // Step 4: Role Detection
      let roleMatched = null;
      if (options.checkRole) {
        const roleResult = await RoleDetectionService.isRoleAccount(localPart, options);
        if (roleResult.isRole) {
          return { valid: false, type: "ROLE_EMAIL", suggestion: null, role: roleResult.matchedRole || undefined, featureAvailable: true };
        }
      } else {
        featureAvailable = false;
      }

      // Step 5: Typo Detection (Now Async)
      const typo = await TypoDetectionService.detectTypo(domain);
      if (typo) {
        return { valid: true, type: "TYPO", suggestion: typo, featureAvailable };
      }

      // Step 6: Public Detection
      if (options.checkPublic) {
        if (await PublicEmailService.isPublicProvider(domain)) {
          return { valid: false, type: "PUBLIC_EMAIL", suggestion: null, featureAvailable: true };
        }
      } else {
        featureAvailable = false;
      }

      // Passed all checks
      return { valid: true, type: "VALID", suggestion: null, featureAvailable };
    } catch (error) {
      console.error("[Validation Pipeline Error]:", error);
      // Fail-safe gracefully, treat as valid to avoid blocking customer signups on internal failure
      return { valid: true, type: "VALID", suggestion: null }; 
    }
  }
}
