import { PrismaClient } from "@prisma/client";
import logger from "../config/logger.config";

// Tạo Prisma Client instance
const prisma = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "error", emit: "stdout" },
    { level: "warn", emit: "stdout" },
  ],
});

// Log queries trong development mode
if (process.env.NODE_ENV === "development") {
  prisma.$on("query", (e: any) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
