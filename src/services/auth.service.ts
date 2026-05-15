import bcrypt from "bcryptjs";
import prisma from "../db/prisma";
import { LoginRequest, RegisterRequest } from "../types/request/auth";
import { AuthResponse } from "../types/response/auth";
import AppError from "../utils/appError";
import { STATUS } from "../constant/status.constant";
import { ROLE } from "../constant/role.constant";
import { generateToken, refreshAccessToken } from "../utils/jwt";
import otpService from "./otp.service";
import { OTPType } from "@prisma/client";
import { ROLE_CONSTANTS } from "../constant/common.constant";

export const signUpAccount = async (
  data: RegisterRequest,
): Promise<{ userId: string }> => {
  const [existingEmail, existingUsername] = await Promise.all([
    // Check if email exists
    prisma.user.findFirst({
      where: { email: { equals: data.email, mode: "insensitive" } },
    }),
    // Check if username exists
    prisma.user.findFirst({
      where: { username: { equals: data.username, mode: "insensitive" } },
    }),
  ]);

  if (existingEmail) {
    throw AppError.conflict(
      "Email này đã được sử dụng",
      "EMAIL_ALREADY_EXISTS",
    );
  }

  if (existingUsername) {
    throw AppError.conflict(
      "Tên đăng nhập đã được sử dụng",
      "USERNAME_ALREADY_EXISTS",
    );
  }

  // Hash password
  const hashedPasswordPromise = bcrypt.hash(data.password, 10);
  const hashedPassword = await hashedPasswordPromise;

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      username: data.username,
      password: hashedPassword,
      role: ROLE.USER,
      status: STATUS.INACTIVE,
    },
  });

  // Send OTP email
  otpService
    .createAndSendRegistrationOTP(user.id, user.email, user.username)
    .catch((error) => {
      console.log("Lỗi khi gửi OTP đến email: ", error);
    });

  return {
    userId: user.id,
  };
};

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: data.email,
        mode: "insensitive",
      },
    },
  });

  if (!user) {
    throw AppError.unauthorized(
      "Email nhập vào không tồn tại",
      "INVALID_EMAIL_CREADENTIALS",
    );
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw AppError.unauthorized(
      "Mật khẩu nhập vào không đúng",
      "INVALID_PASSWORD_CREADENTIALS",
    );
  }

  // Check user status
  if (user.status !== STATUS.ACTIVE) {
    throw AppError.forbidden(
      "Tài khoản này đã bị khóa hoặc chưa được kích hoạt",
      "ACCOUNT_INACTIVE",
    );
  }

  // Generate token
  const { accessToken, refreshToken } = generateToken(
    user.id,
    user.username,
    user.email,
    user.role,
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const verifyRegistrationOTP = async (
  userId: string,
  otp: string,
): Promise<AuthResponse> => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw AppError.notFound("Người dùng không tồn tại", "USER_NOT_FOUND");
  }

  // Check user active
  if (user.status === STATUS.ACTIVE) {
    throw AppError.badRequest("Tài khoản đã được kích hoạt", "ACCOUNT_ACTIVE");
  }

  // Verify OTP
  await otpService.verifyOTP(userId, otp, OTPType.REGISTER);

  // Update user status
  await prisma.user.update({
    where: { id: userId },
    data: { status: STATUS.ACTIVE },
  });

  // Generate token
  const { accessToken, refreshToken } = generateToken(
    user.id,
    user.username,
    user.email,
    user.role,
  );

  return { accessToken, refreshToken };
};

export const resendRegistrationOTP = async (userId: string): Promise<void> => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw AppError.notFound("Người dùng không tồn tại", "USER_NOT_FOUND");
  }

  // Check user active
  if (user.status === STATUS.ACTIVE) {
    throw AppError.badRequest(
      "Tài khoản đã được kích hoạt",
      "ACCOUNT_ALREADY_ACTIVE",
    );
  }

  // Resend OTP
  otpService.resendOTP(userId, OTPType.REGISTER).catch((error) => {
    console.log("Lỗi khi gửi lại OTP: ", error);
  });
};

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await prisma.user.findFirst({
    where: {
      email: {equals: email, mode: "insensitive"},
    },
    select: {
      id: true,
      email: true,
      username: true,
      status: true,
    }
  });

  if (!user) return;

  if (user.status !== STATUS.ACTIVE) return;

  // Fire and forget
  void otpService
    .createAndSendResetPasswordToken(user.id, user.email, user.username)
    .catch((error) => {
      console.error("Failed to send reset password email:", error);
    });
}

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const { userId, otpId } = await otpService.verifyResetPasswordToken(token);

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) {
    throw AppError.notFound("Người dùng không tồn tại", "USER_NOT_FOUND");
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    throw AppError.badRequest("Mật khẩu mới không được trùng với mật khẩu cũ", "SAME_PASSWORD");
  }

  await prisma.$transaction(async (tx) => {
    const markResult = await tx.oTP.updateMany({
      where: {
        id: otpId,
        usedOn: null,
      },
      data: {
        usedOn: new Date(),
      },
    });

    if (markResult.count === 0) {
      throw AppError.badRequest(
        "Link đặt lại mật khẩu đã được sử dụng",
        "RESET_TOKEN_USED",
      );
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        modifiedOn: new Date(),
        modifiedBy: ROLE_CONSTANTS.SYSTEM,
      },
    });
  });
}

export const validateResetToken = async (token: string): Promise<boolean> => {
  return otpService.validateResetToken(token);
};

export const refreshToken = async (token: string) => {
  return refreshAccessToken(token);
};