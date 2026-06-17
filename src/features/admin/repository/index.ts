import { prisma } from "@/lib/db";

export class AdminRepository {
  static async getOverviewStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Run queries sequentially or in small chunks to avoid exhausting the Prisma connection pool (limit: 5)
    const totalUsers = await prisma.user.count();
    const activeSubscriptionsCount = await prisma.subscription.count({ where: { status: "ACTIVE" } });
    const totalDomains = await prisma.domain.count();
    const pendingUpgradesCount = await prisma.upgradeRequest.count({ where: { status: "PENDING" } });
    
    const pendingRequests = await prisma.upgradeRequest.findMany({
      where: { status: "PENDING" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
    
    const recentPayments = await prisma.payment.findMany({
      where: { status: "SUCCEEDED", createdAt: { gte: startOfMonth } },
      include: { user: { include: { subscription: { include: { plan: true } } } } }
    });
    
    const validationLogsToday = await prisma.validationLog.count({ where: { createdAt: { gte: startOfDay } } });
    const validationLogsThisMonth = await prisma.validationLog.count({ where: { createdAt: { gte: startOfMonth } } });
    const totalValidationLogs = await prisma.validationLog.count();
    const validValidationLogs = await prisma.validationLog.count({ where: { status: "VALID" } });
    
    const usersLast30Days = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    });
    
    const paymentsLast30Days = await prisma.payment.findMany({
      where: { status: "SUCCEEDED", createdAt: { gte: thirtyDaysAgo } },
      select: { amount: true, createdAt: true }
    });
    
    const recentUsers = await prisma.user.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, name: true, createdAt: true } });
    const recentDomains = await prisma.domain.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, hostname: true, createdAt: true, user: { select: { name: true } } } });
    const recentKeys = await prisma.apiKey.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, name: true, createdAt: true, domain: { select: { user: { select: { name: true } } } } } });
    const recentSubs = await prisma.subscription.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, createdAt: true, plan: { select: { name: true } }, user: { select: { name: true } } } });
    const allPlans = await prisma.plan.findMany();

    const monthlyRevenue = recentPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

    // Revenue Trend & User Growth (30 days)
    const revenueTrend = [];
    const userGrowth = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayRevenue = paymentsLast30Days
        .filter((p: any) => p.createdAt >= dayStart && p.createdAt < dayEnd)
        .reduce((sum: number, p: any) => sum + p.amount, 0);

      const dayUsers = usersLast30Days
        .filter((u: any) => u.createdAt >= dayStart && u.createdAt < dayEnd).length;

      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      revenueTrend.push({ date: dateStr, revenue: dayRevenue / 100 }); // assuming amount is in cents
      userGrowth.push({ date: dateStr, users: dayUsers });
    }

    // Activity Feed
    let activityFeed = [
      ...recentUsers.map((u: any) => ({ id: u.id, type: "USER_REGISTERED", title: "New User Registered", description: u.name, createdAt: u.createdAt })),
      ...recentDomains.map((d: any) => ({ id: d.id, type: "WEBSITE_ADDED", title: "Website Added", description: `${d.hostname} by ${d.user?.name}`, createdAt: d.createdAt })),
      ...recentKeys.map((k: any) => ({ id: k.id, type: "API_KEY_CREATED", title: "API Key Created", description: `${k.name} by ${k.domain?.user?.name}`, createdAt: k.createdAt })),
      ...recentSubs.map((s: any) => ({ id: s.id, type: "SUBSCRIPTION_PURCHASED", title: "Subscription Purchased", description: `${s.plan?.name} by ${s.user?.name}`, createdAt: s.createdAt }))
    ];
    activityFeed.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
    activityFeed = activityFeed.slice(0, 10);

    // Business Insights: Top Plans & Revenue By Plan
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      include: { plan: true }
    });

    const subscriptionDistribution = activeSubscriptions.reduce((acc: any, sub: any) => {
      const planName = sub.plan?.name || "Unknown";
      acc[planName] = (acc[planName] || 0) + 1;
      return acc;
    }, {});

    const topPlans = Object.keys(subscriptionDistribution).map(name => ({
      name,
      value: subscriptionDistribution[name]
    }));

    const revenueByPlanObj = recentPayments.reduce((acc: any, payment: any) => {
      const planName = payment.user?.subscription?.plan?.name || "No Plan";
      acc[planName] = (acc[planName] || 0) + payment.amount;
      return acc;
    }, {});

    const revenueByPlan = Object.keys(revenueByPlanObj).map(name => ({
      name,
      revenue: revenueByPlanObj[name] / 100 // format as dollars
    }));

    // System Health
    const validationSuccessRate = totalValidationLogs > 0 ? (validValidationLogs / totalValidationLogs) * 100 : 0;

    return {
      kpis: {
        totalUsers,
        activeSubscriptionsCount,
        monthlyRevenue: monthlyRevenue / 100, // cents to dollars
        totalDomains,
        apiRequestsToday: validationLogsToday,
        apiRequestsThisMonth: validationLogsThisMonth,
      },
      charts: {
        revenueTrend,
        userGrowth,
        topPlans,
        revenueByPlan,
      },
      operations: {
        pendingUpgradesCount,
        pendingRequests,
        activityFeed,
      },
      health: {
        apiStatus: "Operational",
        validationSuccessRate,
      }
    };
  }

  static async resolveUpgradeRequest(requestId: string, status: "APPROVED" | "REJECTED") {
    return await prisma.$transaction(async (tx: any) => {
      const request = await tx.upgradeRequest.update({
        where: { id: requestId },
        data: { status },
      });

      if (status === "APPROVED") {
        // If approved, update user subscription to the requested plan
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

        await tx.subscription.upsert({
          where: { userId: request.userId },
          create: {
            userId: request.userId,
            planId: request.requestedPlanId,
            status: "ACTIVE",
            currentPeriodEnd,
          },
          update: {
            planId: request.requestedPlanId,
            status: "ACTIVE",
            currentPeriodEnd,
          },
        });
      }

      return request;
    });
  }

  static async getUsers() {
    return await prisma.user.findMany({
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
        domains: {
          include: {
            apiKeys: true,
          }
        },
        usageCounters: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
        domains: {
          include: {
            apiKeys: true,
            validationLogs: {
              orderBy: { createdAt: "desc" },
              take: 5,
            }
          }
        },
        usageCounters: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }

  static async suspendUser(id: string) {
    return await prisma.user.update({
      where: { id },
      data: { status: "SUSPENDED" },
    });
  }

  static async reactivateUser(id: string) {
    return await prisma.user.update({
      where: { id },
      data: { status: "ACTIVE" },
    });
  }

  static async deleteUser(id: string) {
    return await prisma.user.update({
      where: { id },
      data: { status: "DELETED" },
    });
  }

  static async grantCredits(userId: string, amount: number) {
    return await prisma.subscription.update({
      where: { userId },
      data: {
        extraCredits: { increment: amount },
      },
    });
  }

  static async removeCredits(userId: string, amount: number) {
    return await prisma.subscription.update({
      where: { userId },
      data: {
        extraCredits: { decrement: amount },
      },
    });
  }

  static async resetCredits(userId: string) {
    return await prisma.subscription.update({
      where: { userId },
      data: {
        extraCredits: 0,
      },
    });
  }

  static async changeUserPlan(userId: string, planId: string) {
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);
    return await prisma.subscription.update({
      where: { userId },
      data: {
        planId,
        status: "ACTIVE",
        currentPeriodEnd,
      },
    });
  }

  static async updateUserRole(userId: string, role: "USER" | "ADMIN") {
    return await prisma.user.update({
      where: { id: userId },
      data: { globalRole: role },
    });
  }

  static async getSubscriptions() {
    return await prisma.subscription.findMany({
      include: {
        user: true,
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateExtraCredits(userId: string, extraCredits: number) {
    return await prisma.subscription.update({
      where: { userId },
      data: { extraCredits },
    });
  }

  static async getDomains() {
    return await prisma.domain.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getApiKeys() {
    return await prisma.apiKey.findMany({
      include: {
        domain: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getUpgradeRequests() {
    return await prisma.upgradeRequest.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getNewsletterSubscribers() {
    return await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  // -------------------------------------------------------------------------
  // Blog Posts
  // -------------------------------------------------------------------------

  static async getBlogPosts() {
    return await prisma.blogPost.findMany({
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createBlogPost(data: {
    authorId: string;
    slug: string;
    title: string;
    excerpt?: string;
    featuredImage?: string;
    seoTitle?: string;
    seoDescription?: string;
    content: string;
    published?: boolean;
  }) {
    return await prisma.blogPost.create({ data });
  }

  static async updateBlogPost(
    id: string,
    data: {
      title?: string;
      slug?: string;
      excerpt?: string;
      featuredImage?: string;
      seoTitle?: string;
      seoDescription?: string;
      content?: string;
      published?: boolean;
    }
  ) {
    return await prisma.blogPost.update({ where: { id }, data });
  }

  static async deleteBlogPost(id: string) {
    return await prisma.blogPost.delete({ where: { id } });
  }

  static async toggleBlogPostPublished(id: string, published: boolean) {
    return await prisma.blogPost.update({
      where: { id },
      data: { published },
    });
  }

  // -------------------------------------------------------------------------
  // CMS Pages
  // -------------------------------------------------------------------------

  static async getCmsPages() {
    return await prisma.cmsPage.findMany({
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createCmsPage(data: {
    authorId: string;
    slug: string;
    title: string;
    seoTitle?: string;
    seoDescription?: string;
    content: string;
    published?: boolean;
  }) {
    return await prisma.cmsPage.create({ data });
  }

  static async updateCmsPage(
    id: string,
    data: {
      title?: string;
      slug?: string;
      seoTitle?: string;
      seoDescription?: string;
      content?: string;
      published?: boolean;
    }
  ) {
    return await prisma.cmsPage.update({ where: { id }, data });
  }

  static async deleteCmsPage(id: string) {
    return await prisma.cmsPage.delete({ where: { id } });
  }

  static async toggleCmsPagePublished(id: string, published: boolean) {
    return await prisma.cmsPage.update({
      where: { id },
      data: { published },
    });
  }

  // -------------------------------------------------------------------------
  // System Stats (Settings)
  // -------------------------------------------------------------------------

  static async getSystemStats() {
    const totalUsers = await prisma.user.count();
    const totalPlans = await prisma.plan.count();
    const activePlans = await prisma.plan.count({ where: { isActive: true } });
    const totalDomains = await prisma.domain.count();
    const totalApiKeys = await prisma.apiKey.count();
    const activeApiKeys = await prisma.apiKey.count({ where: { isActive: true } });
    const totalBlogPosts = await prisma.blogPost.count();
    const publishedBlogPosts = await prisma.blogPost.count({ where: { published: true } });
    const totalCmsPages = await prisma.cmsPage.count();
    const publishedCmsPages = await prisma.cmsPage.count({ where: { published: true } });
    const totalNewsletterSubscribers = await prisma.newsletterSubscriber.count();
    const totalValidationLogs = await prisma.validationLog.count();

    return {
      totalUsers,
      totalPlans,
      activePlans,
      totalDomains,
      totalApiKeys,
      activeApiKeys,
      totalBlogPosts,
      publishedBlogPosts,
      totalCmsPages,
      publishedCmsPages,
      totalNewsletterSubscribers,
      totalValidationLogs,
    };
  }
}
