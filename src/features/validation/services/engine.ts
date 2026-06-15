import { ValidationResponse, ValidationOptions } from "../types";

export class SyntaxService {
  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export class TldValidationService {
  static readonly COMMON_TLDS = new Set([
    "com", "org", "net", "edu", "gov", "io", "co", "uk", "us", "de", 
    "app", "dev", "ai", "tech", "info", "biz", "me", "tv", "ca", "au"
  ]);

  static isValid(domain: string): boolean {
    const parts = domain.split('.');
    const tld = parts[parts.length - 1].toLowerCase();
    
    // In Edge production, this queries a minimized JSON tree from the TLD-List repo.
    // For MVP, if it matches common TLDs or is a standard 2-6 char TLD, it passes.
    if (this.COMMON_TLDS.has(tld)) return true;
    if (tld.length >= 2 && tld.length <= 6) return true;
    return false;
  }
}

export class DisposableService {
  // Mocked for MVP. In production, this proxies to a Redis SISMEMBER command 
  // to evaluate against the 100k+ disposable domains repo instantly at the Edge.
  static readonly MOCKS = new Set([
    "mailinator.com", "10minutemail.com", "tempmail.com", "guerrillamail.com",
    "sharklasers.com", "yopmail.com", "throwawaymail.com"
  ]);

  static async isDisposable(domain: string): Promise<boolean> {
    return this.MOCKS.has(domain.toLowerCase());
  }
}

export class RoleDetectionService {
  static readonly ROLE_ACCOUNTS = new Set([
    "admin", "info", "support", "sales", "billing", "hr", "contact",
    "webmaster", "postmaster", "hostmaster", "abuse", "noc", "security"
  ]);

  static isRoleAccount(localPart: string): boolean {
    return this.ROLE_ACCOUNTS.has(localPart.toLowerCase());
  }
}

export class PublicEmailService {
  static readonly PUBLIC_PROVIDERS = new Set([
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com",
    "aol.com", "protonmail.com", "mail.com", "zoho.com", "yandex.com"
  ]);

  static isPublicProvider(domain: string): boolean {
    return this.PUBLIC_PROVIDERS.has(domain.toLowerCase());
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

  static detectTypo(domain: string): string | null {
    if (PublicEmailService.isPublicProvider(domain)) return null;

    let closestMatch = null;
    let minDistance = 2; // Max distance for typo consideration

    for (const provider of PublicEmailService.PUBLIC_PROVIDERS) {
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

      // Step 2: TLD Validation
      if (!TldValidationService.isValid(domain)) {
        return { valid: false, type: "INVALID_TLD", suggestion: null };
      }

      // Step 3: Disposable Detection (Async for Redis readiness)
      if (await DisposableService.isDisposable(domain)) {
        return { valid: false, type: "DISPOSABLE", suggestion: null };
      }

      // Step 4: Role Detection (If enabled by plan)
      if (options.checkRole && RoleDetectionService.isRoleAccount(localPart)) {
        return { valid: false, type: "ROLE", suggestion: null };
      }

      // Step 5: Typo Detection
      const typo = TypoDetectionService.detectTypo(domain);
      if (typo) {
        return { valid: true, type: "TYPO", suggestion: typo };
      }

      // Step 6: Public Detection (If enabled by plan)
      if (options.checkPublic && PublicEmailService.isPublicProvider(domain)) {
        return { valid: false, type: "PUBLIC", suggestion: null };
      }

      // Passed all checks
      return { valid: true, type: "VALID", suggestion: null };
    } catch (error) {
      console.error("[Validation Pipeline Error]:", error);
      // Fail-safe gracefully, treat as valid to avoid blocking customer signups on internal failure
      return { valid: true, type: "VALID", suggestion: null }; 
    }
  }
}
