import * as userDb from "../db/user.db";
import { UpdateUserProfileRequest } from "../types/request/user";
import { UserProfileResponse } from "../types/response/user";
import AppError from "../utils/appError";
import { normalizePhone } from "../utils/common";

export const getMe = async (userId: string): Promise<UserProfileResponse> => {
  const user = await userDb.findUserById(userId);
  if (!user) {
    throw AppError.notFound(
      "Không tìm thấy thông tin người dùng",
      "USER_NOT_FOUND",
    );
  }
  return user;
};

export const updateUserProfile = async (
  userId: string,
  data: UpdateUserProfileRequest,
) => {
  if (data.phone && !/^[0-9]{9,11}$/.test(normalizePhone(data.phone)!)) {
    throw AppError.badRequest("Số điện thoại không hợp lệ");
  }

  const cleanData = Object.fromEntries(
    Object.entries({
      ...data,
      phone: normalizePhone(data.phone),
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    }).filter(([, v]) => v !== undefined),
  );

  return userDb.upsertUserProfile(userId, cleanData);
};
