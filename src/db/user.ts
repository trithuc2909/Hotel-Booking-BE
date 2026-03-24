import { UserProfileResponse } from "../types/response/user";
import prisma from "./prisma";

export const findUserById = async (
  userId: string
): Promise<UserProfileResponse | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    phone: user.profile?.phone ?? "",
    fullName: user.profile?.fullName ?? "",
    avatarUrl: user.profile?.avatarUrl ?? "",
    address: user.profile?.address ?? "",
    nationality: user.profile?.nationality ?? "",
    dateOfBirth: user.profile?.dateOfBirth?.toISOString() ?? ""
  };
};