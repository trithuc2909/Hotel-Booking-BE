import { STATUS } from "../constant/status.constant";
import prisma from "./prisma";

export const findAllPromotions = async () => {
  const now = new Date();

  return prisma.promotion.findMany({
    where: {
      status: STATUS.ACTIVE,
      OR: [{ startDate: null }, { startDate: { lte: now } }],
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
    },
    orderBy: { createdOn: "desc" },
  });
};

export const findPromotionByCode = async (code: string, userId: string) => {
  return prisma.promotion.findUnique({
    where: { code },
    include: {
      _count: {
        select: { usages: true },
      },
      usages: {
        where: { userId },
        select: { id: true },
      },
    },
  });
};
