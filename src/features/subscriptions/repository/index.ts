import { prisma } from "@/lib/db";
import { AssignSubscriptionInput, UpdateSubscriptionInput } from "../schemas";

export class SubscriptionRepository {
  static async upsertSubscription(data: AssignSubscriptionInput) {
    return await prisma.subscription.upsert({
      where: { userId: data.userId },
      create: data,
      update: data,
      include: { plan: true },
    });
  }

  static async updateSubscription(userId: string, data: Omit<UpdateSubscriptionInput, "userId">) {
    return await prisma.subscription.update({
      where: { userId },
      data,
      include: { plan: true },
    });
  }

  static async getSubscriptionByUserId(userId: string) {
    return await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });
  }

  static async updateExtraCredits(userId: string, amount: number) {
    return await prisma.subscription.update({
      where: { userId },
      data: { extraCredits: { increment: amount } },
      include: { plan: true },
    });
  }

  static async createUpgradeRequest(userId: string, requestedPlanId: string) {
    return await prisma.upgradeRequest.create({
      data: {
        userId,
        requestedPlanId,
        status: "PENDING",
      },
    });
  }

  static async getPendingUpgradeRequest(userId: string) {
    return await prisma.upgradeRequest.findFirst({
      where: {
        userId,
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
