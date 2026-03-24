import { findUserById } from "../db/user";
import { UserProfileResponse } from "../types/response/user";
import AppError from "../utils/appError";

export const getMe = async (userId: string): Promise<UserProfileResponse> => {
  const user = await findUserById(userId);
  if (!user) {
    throw AppError.notFound(
      "Không tìm thấy thông tin người dùng",
      "USER_NOT_FOUND",
    );
  }
  return user;
};
