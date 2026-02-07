import bcrypt from "bcryptjs";
import prisma from "../db/prisma";
import { LoginRequest, RegisterRequest } from "../types/request/auth";
import { AuthResponse } from "../types/response/auth";
import AppError from "../utils/appError";
import { STATUS } from "../constant/status.constant";
import { ROLE } from "../constant/role.constant";
import { generateToken } from "../utils/jwt";
import otpService from "./otp.service";
import { OTPType } from "@prisma/client";
import { error } from "node:console";

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
