"use server";

import { signIn, auth } from "@/lib/auth";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "../schemas";
import { AuthService } from "../services";
import { AuthRepository } from "../repository";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

export async function loginAction(data: LoginInput) {
  try {
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid credentials." };
        default:
          return { success: false, error: "Authentication failed." };
      }
    }
    throw error;
  }
}

export async function registerAction(data: RegisterInput) {
  try {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    await AuthService.registerWithCredentials(parsed.data);

    // Auto-login after successful registration
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return { success: false, error: message };
  }
}

export async function googleLoginAction() {
  await signIn("google");
}

export async function updateProfileAction(data: { name: string; email: string; image?: string | null }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const updated = await AuthRepository.updateProfile(session.user.id, data);
    return { success: true, data: updated };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return { success: false, error: message };
  }
}

export async function getCurrentUserAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const user = await AuthRepository.findUserById(session.user.id);
    if (!user) return { success: false, error: "User not found" };
    return {
      success: true,
      data: {
        name: user.name,
        email: user.email,
        image: user.image,
        hasPassword: !!user.passwordHash,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch user";
    return { success: false, error: message };
  }
}

export async function changePasswordAction(data: { currentPassword?: string; newPassword: string }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const user = await AuthRepository.findUserById(session.user.id);
    if (!user) return { success: false, error: "User not found" };

    // If user has a password set (credentials registration), they must verify it first
    if (user.passwordHash) {
      if (!data.currentPassword) {
        return { success: false, error: "Current password is required." };
      }
      const matches = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!matches) {
        return { success: false, error: "Incorrect current password." };
      }
    }

    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(data.newPassword, salt);
    await AuthRepository.updatePassword(session.user.id, newHash);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update password";
    return { success: false, error: message };
  }
}
