import prisma from "./prisma";

export const findAllRoomTypes = async () => {
  return prisma.roomType.findMany({
    where: { status: "ACT" },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
    },
    orderBy: { name: "asc" },
  });
};

export const findAllAmenities = async () => {
  return prisma.amenity.findMany({
    where: { status: "ACT" },
    select: {
      id: true,
      name: true,
      icon: true,
    },
    orderBy: { name: "asc" },
  });
};
