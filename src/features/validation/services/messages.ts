import { ValidationMessageType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { DEFAULT_VALIDATION_MESSAGES } from "../constants/messages";

export class ValidationMessageService {
  /**
   * Resolves the validation message based on priority:
   * 1. Website Custom Message
   * 2. Global User Message
   * 3. System Default Message
   */
  static async resolveMessage(
    userId: string,
    type: ValidationMessageType,
    websiteId?: string,
    suggestion?: string | null
  ): Promise<string> {
    const defaultMsg = DEFAULT_VALIDATION_MESSAGES[type];

    // Typo substitution for defaults
    const finalizeMsg = (msg: string) => {
      if (type === "TYPO" && suggestion) {
        return msg.replace("%s", suggestion);
      }
      return msg;
    };

    try {
      // Look up custom messages
      // We look up both website and global in one query if websiteId is provided
      const conditions = websiteId 
        ? [{ userId, websiteId, messageType: type, isEnabled: true }, { userId, websiteId: null, messageType: type, isEnabled: true }]
        : [{ userId, websiteId: null, messageType: type, isEnabled: true }];

      const overrides = await prisma.validationMessage.findMany({
        where: {
          OR: conditions
        }
      });

      if (overrides.length > 0) {
        // Priority 1: Website
        if (websiteId) {
          const websiteOverride = overrides.find((o: any) => o.websiteId === websiteId);
          if (websiteOverride) return finalizeMsg(websiteOverride.message);
        }

        // Priority 2: Global
        const globalOverride = overrides.find((o: any) => o.websiteId === null);
        if (globalOverride) return finalizeMsg(globalOverride.message);
      }

    } catch (err) {
      console.error("[ValidationMessageService] Error resolving message:", err);
    }

    // Priority 3: Default
    return finalizeMsg(defaultMsg);
  }

  static getAvailableMessageTypes(): ValidationMessageType[] {
    return Object.keys(DEFAULT_VALIDATION_MESSAGES) as ValidationMessageType[];
  }

  static async updateMessage(
    userId: string,
    messageType: ValidationMessageType,
    message: string,
    isEnabled: boolean = true,
    websiteId?: string
  ) {
    return await prisma.validationMessage.upsert({
      where: {
        userId_websiteId_messageType: {
          userId,
          websiteId: websiteId || null,
          messageType
        }
      },
      update: { message, isEnabled },
      create: {
        userId,
        websiteId: websiteId || null,
        messageType,
        message,
        isEnabled
      }
    });
  }

  static async resetToDefault(userId: string, messageType: ValidationMessageType, websiteId?: string) {
    return await prisma.validationMessage.deleteMany({
      where: {
        userId,
        websiteId: websiteId || null,
        messageType
      }
    });
  }

  static async getMessages(userId: string, websiteId?: string) {
    return await prisma.validationMessage.findMany({
      where: {
        userId,
        websiteId: websiteId || null
      }
    });
  }
}
