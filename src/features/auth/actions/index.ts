"use server";

import { signIn } from "@/lib/auth";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "../schemas";
import { AuthService } from "../services";
import { AuthError } from "next-auth";

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
