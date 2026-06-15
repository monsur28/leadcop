import { UsageRepository } from "../repository";
import { ValidationStatus } from "@prisma/client";

export class UsageService {
  /**
   * Maps the engine status to the Prisma Database Enum, and safely processes the transaction.
   */
  static async trackValidationUsage(
    userId: string,
    domainId: string,
    validatedDomain: string,
    engineStatus: string,
    apiKeyId?: string
  ) {
    let dbStatus: ValidationStatus = ValidationStatus.VALID;

    // Map Engine Strings to DB Enums
    switch (engineStatus) {
      case "INVALID_SYNTAX":
      case "INVALID_TLD":
        dbStatus = ValidationStatus.INVALID;
        break;
      case "DISPOSABLE":
        dbStatus = ValidationStatus.DISPOSABLE;
        break;
      case "ROLE":
        dbStatus = ValidationStatus.ROLE;
        break;
      case "PUBLIC":
        dbStatus = ValidationStatus.FREE_PROVIDER;
        break;
      case "CUSTOM_BLOCKLIST":
        dbStatus = ValidationStatus.BLOCKLISTED;
        break;
      case "TYPO":
      case "VALID":
      default:
        dbStatus = ValidationStatus.VALID;
        break;
    }

    return await UsageRepository.trackValidationAtomic({
      userId,
      domainId,
      apiKeyId: apiKeyId || null,
      validatedDomain,
      status: dbStatus,
    });
  }
}
