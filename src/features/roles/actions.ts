"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleSystemRole(roleAddressId: string, isBlocked: boolean, websiteId: string | null = null) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const existing = await prisma.websiteRoleRule.findFirst({
    where: {
      userId,
      roleAddressId,
      websiteId
    }
  });

  if (existing) {
    await prisma.websiteRoleRule.update({
      where: { id: existing.id },
      data: { isBlocked }
    });
  } else {
    await prisma.websiteRoleRule.create({
      data: {
        userId,
        roleAddressId,
        websiteId,
        isBlocked
      }
    });
  }

  revalidatePath("/dashboard/role-detection");
}

export async function addCustomRole(name: string, websiteId: string | null = null) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const cleanName = name.trim().toLowerCase();

  if (!cleanName) throw new Error("Role name cannot be empty");

  await prisma.customRoleAddress.create({
    data: {
      userId,
      name: cleanName,
      websiteId
    }
  });

  revalidatePath("/dashboard/role-detection");
}

export async function deleteCustomRole(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  await prisma.customRoleAddress.deleteMany({
    where: {
      id,
      userId
    }
  });

  revalidatePath("/dashboard/role-detection");
}
