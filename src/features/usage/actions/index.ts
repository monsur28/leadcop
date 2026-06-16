"use server";

import { auth } from "@/lib/auth";
import { UsageRepository } from "../repository";

export async function getUsageAnalyticsAction(days: number = 30) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const userId = session.user.id;
    const [breakdown, trends, summary] = await Promise.all([
      UsageRepository.getValidationLogsBreakdown(userId),
      UsageRepository.getDailyTrends(userId, days),
      UsageRepository.getUserUsageSummary(userId),
    ]);

    return {
      success: true,
      data: {
        breakdown,
        trends,
        summary,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function getDashboardOverviewAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const userId = session.user.id;
    const overview = await UsageRepository.getDashboardOverviewData(userId);
    return { success: true, data: overview };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}
