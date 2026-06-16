import { prisma } from "@/lib/db";

export class AdminRepository {
  static async getOverviewStats() {
    const [
      totalUsers,
      pendingUpgradesCount,
      totalDomains,
      activeApiKeys,
      pendingRequests
    ] = await Promise.all([
      prisma.user.count(),
      prisma.upgradeRequest.count({ where: { status: "PENDING" } }),
      prisma.domain.count(),
      prisma.apiKey.count({ where: { isActive: true } }),
      prisma.upgradeRequest.findMany({
        where: { status: "PENDING" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
        },
      }),
    ]);

    return {
      totalUsers,
      pendingUpgradesCount,
      totalDomains,
      activeApiKeys,
      pendingRequests,
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
      orderBy: { createdAt: "desc" },
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
    const [
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
    ] = await Promise.all([
      prisma.user.count(),
      prisma.plan.count(),
      prisma.plan.count({ where: { isActive: true } }),
      prisma.domain.count(),

      prisma.apiKey.count(),
      prisma.apiKey.count({ where: { isActive: true } }),
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { published: true } }),
      prisma.cmsPage.count(),
      prisma.cmsPage.count({ where: { published: true } }),
      prisma.newsletterSubscriber.count(),
      prisma.validationLog.count(),
    ]);

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
