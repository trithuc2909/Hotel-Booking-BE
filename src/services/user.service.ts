import * as userDb from "../db/user.db";
import { UpdateUserProfileRequest } from "../types/request/user";
import { UserProfileResponse } from "../types/response/user";
import AppError from "../utils/appError";
import { normalizePhone } from "../utils/common";
import { minioService } from "./minio.service";
import bcrypt from "bcryptjs";

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

export const uploadUserAvatar = async (
  userId: string,
  file: Express.Multer.File,
) => {
  if (!file) {
    throw AppError.badRequest("Vui lòng tải ảnh lên", "AVATAR_FILE_REQUIRED");
  }

  const uploaded = await minioService.uploadUserAvatar(userId, file);
  const profile = await userDb.upsertUserProfile(userId, {
    avatarUrl: uploaded.url,
  });

  return { avatarUrl: profile.avatarUrl };
};

export const changeUserPassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
) => {
  const user = await userDb.findPasswordByUserId(userId);
  if (!user || !user.password)
    throw AppError.notFound("Không tìm thấy người dùng", "USER_NOT_FOUND");
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch)
    throw AppError.badRequest("Mật khẩu cũ không đúng", "WRONG_PASSWORD");
  const hashed = await bcrypt.hash(newPassword, 10);
  await userDb.updateUserPassword(userId, hashed);
};
