"use server";

import { auth } from "@/lib/auth";
import { AdminRepository } from "../repository";
import { UnauthorizedError } from "@/lib/errors";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.globalRole !== "ADMIN") {
    throw new UnauthorizedError("Admin access required");
  }
}

export async function getAdminOverviewAction() {
  try {
    await requireAdmin();
    const stats = await AdminRepository.getOverviewStats();
    return { success: true, data: stats };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function resolveUpgradeRequestAction(data: { requestId: string; status: "APPROVED" | "REJECTED" }) {
  try {
    await requireAdmin();
    const schema = z.object({
      requestId: z.string().uuid(),
      status: z.enum(["APPROVED", "REJECTED"]),
    });

    const parsed = schema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const result = await AdminRepository.resolveUpgradeRequest(parsed.data.requestId, parsed.data.status);
    return { success: true, data: result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function getAdminUsersAction() {
  try {
    await requireAdmin();
    const users = await AdminRepository.getUsers();
    return { success: true, data: users };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function updateUserRoleAction(data: { userId: string; role: "USER" | "ADMIN" }) {
  try {
    await requireAdmin();
    const schema = z.object({
      userId: z.string().uuid(),
      role: z.enum(["USER", "ADMIN"]),
    });
    const parsed = schema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const updated = await AdminRepository.updateUserRole(parsed.data.userId, parsed.data.role);
    return { success: true, data: updated };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function getAdminSubscriptionsAction() {
  try {
    await requireAdmin();
    const subscriptions = await AdminRepository.getSubscriptions();
    return { success: true, data: subscriptions };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function updateExtraCreditsAction(data: { userId: string; extraCredits: number }) {
  try {
    await requireAdmin();
    const schema = z.object({
      userId: z.string().uuid(),
      extraCredits: z.number().int().nonnegative(),
    });
    const parsed = schema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const updated = await AdminRepository.updateExtraCredits(parsed.data.userId, parsed.data.extraCredits);
    return { success: true, data: updated };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function getAdminDomainsAction() {
  try {
    await requireAdmin();
    const domains = await AdminRepository.getDomains();
    return { success: true, data: domains };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function getAdminApiKeysAction() {
  try {
    await requireAdmin();
    const keys = await AdminRepository.getApiKeys();
    return { success: true, data: keys };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function getAdminUpgradeRequestsAction() {
  try {
    await requireAdmin();
    const requests = await AdminRepository.getUpgradeRequests();
    return { success: true, data: requests };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function getAdminNewsletterAction() {
  try {
    await requireAdmin();
    const subscribers = await AdminRepository.getNewsletterSubscribers();
    return { success: true, data: subscribers };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Blog Post Actions
// ---------------------------------------------------------------------------

export async function getAdminBlogPostsAction() {
  try {
    await requireAdmin();
    const posts = await AdminRepository.getBlogPosts();
    return { success: true, data: posts };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function createBlogPostAction(data: {
  slug: string;
  title: string;
  excerpt?: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  content: string;
  published?: boolean;
}) {
  try {
    await requireAdmin();
    const session = await auth();

    const schema = z.object({
      slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Lowercase alphanumeric and dashes only"),
      title: z.string().min(1, "Title is required"),
      excerpt: z.string().optional(),
      featuredImage: z.string().optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      content: z.string().min(1, "Content is required"),
      published: z.boolean().optional(),
    });

    const parsed = schema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const result = await AdminRepository.createBlogPost({
      ...parsed.data,
      authorId: session?.user?.id ?? "",
    });
    return { success: true, data: result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function updateBlogPostAction(data: {
  id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  content?: string;
  published?: boolean;
}) {
  try {
    await requireAdmin();

    const schema = z.object({
      id: z.string().uuid(),
      title: z.string().min(1).optional(),
      slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
      excerpt: z.string().optional(),
      featuredImage: z.string().optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      content: z.string().min(1).optional(),
      published: z.boolean().optional(),
    });

    const parsed = schema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const { id, ...updateData } = parsed.data;
    const result = await AdminRepository.updateBlogPost(id, updateData);
    return { success: true, data: result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function deleteBlogPostAction(data: { id: string }) {
  try {
    await requireAdmin();

    const schema = z.object({ id: z.string().uuid() });
    const parsed = schema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    await AdminRepository.deleteBlogPost(parsed.data.id);
    return { success: true, data: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function toggleBlogPostAction(data: { id: string; published: boolean }) {
  try {
    await requireAdmin();

    const schema = z.object({ id: z.string().uuid(), published: z.boolean() });
    const parsed = schema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const result = await AdminRepository.toggleBlogPostPublished(parsed.data.id, parsed.data.published);
    return { success: true, data: result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// CMS Page Actions
// ---------------------------------------------------------------------------

export async function getAdminCmsPagesAction() {
  try {
    await requireAdmin();
    const pages = await AdminRepository.getCmsPages();
    return { success: true, data: pages };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function createCmsPageAction(data: {
  slug: string;
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  content: string;
  published?: boolean;
}) {
  try {
    await requireAdmin();
    const session = await auth();

    const schema = z.object({
      slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Lowercase alphanumeric and dashes only"),
      title: z.string().min(1, "Title is required"),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      content: z.string().min(1, "Content is required"),
      published: z.boolean().optional(),
    });

    const parsed = schema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const result = await AdminRepository.createCmsPage({
      ...parsed.data,
      authorId: session?.user?.id ?? "",
    });
    return { success: true, data: result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function updateCmsPageAction(data: {
  id: string;
  title?: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  content?: string;
  published?: boolean;
}) {
  try {
    await requireAdmin();

    const schema = z.object({
      id: z.string().uuid(),
      title: z.string().min(1).optional(),
      slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      content: z.string().min(1).optional(),
      published: z.boolean().optional(),
    });

    const parsed = schema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const { id, ...updateData } = parsed.data;
    const result = await AdminRepository.updateCmsPage(id, updateData);
    return { success: true, data: result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function deleteCmsPageAction(data: { id: string }) {
  try {
    await requireAdmin();

    const schema = z.object({ id: z.string().uuid() });
    const parsed = schema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    await AdminRepository.deleteCmsPage(parsed.data.id);
    return { success: true, data: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

export async function toggleCmsPageAction(data: { id: string; published: boolean }) {
  try {
    await requireAdmin();

    const schema = z.object({ id: z.string().uuid(), published: z.boolean() });
    const parsed = schema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const result = await AdminRepository.toggleCmsPagePublished(parsed.data.id, parsed.data.published);
    return { success: true, data: result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// System Stats (Settings)
// ---------------------------------------------------------------------------

export async function getAdminSystemStatsAction() {
  try {
    await requireAdmin();
    const stats = await AdminRepository.getSystemStats();
    return { success: true, data: stats };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}

