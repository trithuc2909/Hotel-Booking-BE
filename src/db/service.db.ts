import prisma from "./prisma";

export const findAllServices = async () => {
  return prisma.service.findMany({
    where: { status: "ACT" },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
        },
      },
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });
};

export const findAllServiceCategories = async () => {
  return prisma.serviceCategory.findMany({
    where: { status: "ACT" },
    orderBy: { name: "asc" },
  });
};
