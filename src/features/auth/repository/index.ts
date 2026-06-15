import { prisma } from "@/lib/db";
import { RegisterInput } from "../schemas";

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
}
