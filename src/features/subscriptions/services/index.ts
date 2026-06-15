import { SubscriptionRepository } from "../repository";
import { AssignSubscriptionInput, UpdateSubscriptionInput } from "../schemas";
import { AppError } from "@/lib/errors";

export class SubscriptionService {
  static async assignOrUpdate(data: AssignSubscriptionInput) {
    return await SubscriptionRepository.upsertSubscription(data);
  }

  static async updateSubscription(data: UpdateSubscriptionInput) {
    const { userId, ...updateData } = data;
    const sub = await SubscriptionRepository.getSubscriptionByUserId(userId);
    if (!sub) throw new AppError("Subscription not found", 404);

    return await SubscriptionRepository.updateSubscription(userId, updateData);
  }

  static async addBonusCredits(userId: string, amount: number) {
    if (amount <= 0) throw new AppError("Amount must be positive", 400);
    return await SubscriptionRepository.updateExtraCredits(userId, amount);
  }

  static async removeBonusCredits(userId: string, amount: number) {
    const sub = await SubscriptionRepository.getSubscriptionByUserId(userId);
    if (!sub) throw new AppError("Subscription not found", 404);
    
    // Pass negative amount to decrement
    const decrementAmount = -Math.abs(amount);
    return await SubscriptionRepository.updateExtraCredits(userId, decrementAmount);
  }
}

export class FeatureGateService {
  /**
   * Evaluates the user's current subscription state and aggregates limits and features.
   * Centralizes the logic so the Edge Validation Route relies solely on this method.
   */
  static async getAccessLimits(userId: string) {
    const sub = await SubscriptionRepository.getSubscriptionByUserId(userId);
    
    // Deny access if no subscription, canceled, or past due
    if (!sub || sub.status !== "ACTIVE" || sub.currentPeriodEnd < new Date()) {
      return null; 
    }

    return {
      planSlug: sub.plan.slug,
      isUnlimited: sub.isUnlimited,
      extraCredits: sub.extraCredits,
      quotaLimit: sub.plan.quotaLimit,
      domainLimit: sub.plan.domainLimit,
      features: {
        roleDetection: sub.plan.roleDetection,
        publicDetection: sub.plan.publicDetection,
        customBlocklist: sub.plan.customBlocklist,
        bulkValidationLimit: sub.plan.bulkValidationLimit,
      }
    };
  }

  /**
   * Helper to quickly test if a specific feature boolean is active for the user's plan.
   */
  static hasFeatureAccess(limits: any, feature: 'roleDetection' | 'publicDetection' | 'customBlocklist') {
    if (!limits) return false;
    return limits.features[feature] === true;
  }
}
