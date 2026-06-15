import { ApiKeyRepository } from "../repository";
import { CreateApiKeyInput } from "../schemas";
import { DomainRepository } from "@/features/domains/repository";
import { AppError } from "@/lib/errors";
import crypto from "crypto";

export class ApiKeyService {
  static async createKey(userId: string, input: CreateApiKeyInput) {
    // 1. Verify domain belongs to user
    const domain = await DomainRepository.getDomainByIdAndUser(input.domainId, userId);
    if (!domain) throw new AppError("Domain not found or unauthorized", 403);

    // 2. Generate Key
    const rawKey = crypto.randomBytes(32).toString("hex");
    const keyPrefix = rawKey.substring(0, 8);
    
    const prefixStr = input.type === "PUBLIC" ? "lc_pub_" : "lc_sec_";
    const fullRawKey = `${prefixStr}${rawKey}`;

    // 3. Hash Key for secure storage
    const keyHash = crypto.createHash("sha256").update(fullRawKey).digest("hex");

    // 4. Save to DB
    const dbKey = await ApiKeyRepository.createKey(
      domain.id,
      input.name,
      keyHash,
      keyPrefix,
      input.type
    );

    // 5. Return RAW KEY strictly ONCE
    return {
      id: dbKey.id,
      name: dbKey.name,
      rawKey: fullRawKey,
      prefix: dbKey.prefix,
      createdAt: dbKey.createdAt,
    };
  }
}
