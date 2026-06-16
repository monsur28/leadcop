import { prisma } from "@/lib/db";
import { ApiKeyType } from "@prisma/client";

export class ApiKeyRepository {
  static async createKey(domainId: string, name: string, keyHash: string, prefix: string, type: ApiKeyType) {
    return await prisma.apiKey.create({
      data: {
        domainId,
        name,
        keyHash,
        prefix,
        type,
        isActive: true,
      },
    });
  }

  static async getKeysByDomain(domainId: string) {
    return await prisma.apiKey.findMany({
      where: { domainId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async toggleActive(keyId: string, isActive: boolean) {
    return await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive },
    });
  }

  static async deleteKey(keyId: string) {
    return await prisma.apiKey.delete({
      where: { id: keyId },
    });
  }

  static async getKeyWithDomain(keyId: string) {
    return await prisma.apiKey.findUnique({
      where: { id: keyId },
      include: { domain: true },
    });
  }
}
