import { prisma } from "@/lib/db";

export class DomainRepository {
  static async createDomain(userId: string, hostname: string) {
    return await prisma.domain.create({
      data: {
        userId,
        hostname,
        isActive: true,
      },
    });
  }

  static async updateDomain(domainId: string, hostname: string) {
    return await prisma.domain.update({
      where: { id: domainId },
      data: {
        hostname,
      },
    });
  }

  static async deleteDomain(domainId: string) {
    return await prisma.domain.delete({
      where: { id: domainId },
    });
  }

  static async findByHostname(userId: string, hostname: string) {
    return await prisma.domain.findUnique({
      where: { userId_hostname: { userId, hostname } },
    });
  }

  static async countUserDomains(userId: string) {
    return await prisma.domain.count({ where: { userId } });
  }

  static async getUserDomains(userId: string) {
    return await prisma.domain.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  }



  static async toggleActive(domainId: string, isActive: boolean) {
    return await prisma.domain.update({
      where: { id: domainId },
      data: { isActive },
    });
  }
  
  static async getDomainByIdAndUser(domainId: string, userId: string) {
    return await prisma.domain.findFirst({
      where: { id: domainId, userId },
    });
  }
}
