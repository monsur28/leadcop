import { prisma } from "@/lib/db";

export class AuthRepository {
  static async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  static async createUser(data: { email: string; name: string; passwordHash: string }) {
    return await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
      },
    });
  }

  static async updatePassword(userId: string, passwordHash: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  static async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  static async updateProfile(userId: string, data: { name: string; email: string; image?: string | null }) {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
