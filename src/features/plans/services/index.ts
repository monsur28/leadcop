import { PlanRepository } from "../repository";
import { CreatePlanInput, UpdatePlanInput } from "../schemas";
import { ValidationError, AppError } from "@/lib/errors";

export class PlanService {
  static async createPlan(data: CreatePlanInput) {
    const existing = await PlanRepository.getPlanBySlug(data.slug);
    if (existing) {
      throw new ValidationError(`Plan with slug '${data.slug}' already exists.`);
    }
    
    return await PlanRepository.createPlan(data);
  }

  static async updatePlan(data: UpdatePlanInput) {
    const existing = await PlanRepository.getPlanById(data.id);
    if (!existing) {
      throw new AppError("Plan not found", 404);
    }

    const { id, ...updateData } = data;
    return await PlanRepository.updatePlan(id, updateData);
  }

  static async togglePlanStatus(id: string, isActive: boolean) {
    const existing = await PlanRepository.getPlanById(id);
    if (!existing) {
      throw new AppError("Plan not found", 404);
    }

    return await PlanRepository.toggleActive(id, isActive);
  }
}
