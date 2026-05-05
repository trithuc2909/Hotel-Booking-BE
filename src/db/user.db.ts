import { ROLE } from "../constant/role.constant";
import { UpdateUserProfileRequest } from "../types/request/user";
import { UserProfileResponse } from "../types/response/user";
import { normalizePhone } from "../utils/common";
import prisma from "./prisma";

export const findUserById = async (
  userId: string,
): Promise<UserProfileResponse | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
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
    dateOfBirth: user.profile?.dateOfBirth?.toISOString() ?? "",
  };
};

export const upsertUserProfile = async (
  userId: string,
  data: UpdateUserProfileRequest,
) => {
  const patch = Object.fromEntries(
    Object.entries({
      ...data,
      phone: normalizePhone(data.phone),
    }).filter(([, v]) => v !== undefined),
  );

  return prisma.userProfile.upsert({
    where: { userId },
    update: {
      ...patch,
      modifiedOn: new Date(),
      modifiedBy: userId,
    },
    create: {
      ...patch,
      userId,
      createdBy: ROLE.SYSTEM,
    },
  });
};
