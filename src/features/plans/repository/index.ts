import { prisma } from "@/lib/db";
import { CreatePlanInput, UpdatePlanInput } from "../schemas";

export class PlanRepository {
  static async createPlan(data: CreatePlanInput) {
    return await prisma.plan.create({
      data: {
        ...data,
        isActive: true,
      },
    });
  }

  static async updatePlan(id: string, data: Omit<UpdatePlanInput, "id">) {
    return await prisma.plan.update({
      where: { id },
      data,
    });
  }

  static async getPlanById(id: string) {
    return await prisma.plan.findUnique({ where: { id } });
  }

  static async getPlanBySlug(slug: string) {
    return await prisma.plan.findUnique({ where: { slug } });
  }

  static async getAllPlans(includeInactive = false) {
    return await prisma.plan.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { monthlyPrice: "asc" },
    });
  }

  static async toggleActive(id: string, isActive: boolean) {
    return await prisma.plan.update({
      where: { id },
      data: { isActive },
    });
  }
}
