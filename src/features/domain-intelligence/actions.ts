"use server";

import { revalidatePath } from "next/cache";
import { DomainIntelligenceWorker } from "./services/sync-worker";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function triggerManualSync() {
  const session = await auth();
  
  // Basic sanity check, should check user.globalRole === "ADMIN" in a real app, 
  // but assuming auth() returns admin session if in admin routes.
  if (!session?.user) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.globalRole !== "ADMIN") throw new Error("Forbidden");

  // Run all sync workers
  await DomainIntelligenceWorker.runAll();

  // Revalidate the page to show latest sync logs
  revalidatePath("/admin/domain-intelligence");
  
  return { success: true };
}
