import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as {
  prismaEdge: ReturnType<typeof createPrismaClient>;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends(withAccelerate());
}

export const prismaEdge = globalForPrisma.prismaEdge ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaEdge = prismaEdge;
