import config from "../config";
import crypto from "crypto";
import prisma from "../db/prisma";
import emailService from "./email.service";
import bcrypt from "bcryptjs";
import { OTPType } from "@prisma/client";
import AppError from "../utils/appError";
import { pid } from "process";

class OTPService {
  // Generate random OTP code
  private generateOTPCode(): string {
    const length = config.otp.length;
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += crypto.randomInt(0, 10).toString();
    }
    return otp;
  }

  async createAndSendRegistrationOTP(
    userId: string,
    email: string,
    username: string,
  ): Promise<void> {
    // Generate OTP code
    const otpCode = this.generateOTPCode();

    const [hashedCode] = await Promise.all([
      // Hash OTP code
      crypto.createHash("sha256").update(otpCode).digest("hex"),

      // Delete old OTP
      prisma.oTP.deleteMany({
        where: {
          userId,
          purpose: OTPType.REGISTER,
          usedOn: null,
        },
      }),
    ]);

    // Calculate OTP expires time
    const expiresAt = new Date(
      Date.now() + config.otp.expiresMinutes * 60 * 1000,
    );

    // create OTP
    await prisma.oTP.create({
      data: {
        userId,
        code: hashedCode,
        purpose: OTPType.REGISTER,
        expiresAt,
      },
    });

    // Send OTP to email
    await emailService.sendRegistrationOTP(email, username, userId, otpCode);
  }

  async verifyOTP(
    userId: string,
    code: string,
    purpose: OTPType,
  ): Promise<boolean> {
    // Find all OTPs user
    const otps = await prisma.oTP.findMany({
      where: {
        userId,
        purpose,
        usedOn: null, // OTP unused
      },
      orderBy: {
        createdOn: "desc",
      },
    });

    // Hash input code
    const hashedInputCode = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");

    // Find OTP match
    const matchOTP = await prisma.oTP.findFirst({
      where: {
        userId,
        purpose,
        code: hashedInputCode,
        usedOn: null,
      },
      orderBy: {
        createdOn: "desc",
      },
    });

    if (!matchOTP) {
      throw AppError.validation("Mã OTP không hợp lệ", "INVALID_OTP");
    }

    // Check OTP expired
    if (new Date() > matchOTP.expiresAt) {
      throw AppError.validation("Mã OTP đã hết hạn", "OTP_EXPIRED");
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: {
        id: matchOTP.id,
      },
      data: {
        usedOn: new Date(),
      },
    });
    return true;
  }

  async resendOTP(userId: string, purpose: OTPType): Promise<void> {
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        username: true,
      },
    });

    if (!user) {
      throw AppError.notFound("Người dùng không tồn tại", "USER_NOT_FOUND");
    }

    // Create and send new OTP
    if (purpose === OTPType.REGISTER) {
      await this.createAndSendRegistrationOTP(
        userId,
        user.email,
        user.username,
      );
    }
  }

  async createAndSendResetPasswordToken(
    userId: string,
    email: string,
    username: string,
  ): Promise<void> {
    // Generate random token secure
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Calculate token expires time
    const expiresAt = new Date(Date.now() + config.reset_password.expiresMinutes * 60 * 1000);

    // Use transaction to avoid race condition
    await prisma.$transaction([
      prisma.oTP.deleteMany({
        where: {
          userId,
          purpose: OTPType.RESET_PASSWORD,
          usedOn: null,
        },
      }),

      prisma.oTP.create({
        data: {
          userId,
          code: hashedToken,
          purpose: OTPType.RESET_PASSWORD,
          expiresAt,
        },
      }),
    ]);

    // Build reset password url
    const resetUrl = `${config.frontend.url}/reset-password?token=${resetToken}`;

    // Send email
    await emailService.sendResetPasswordEmail(email, username, resetUrl);
  }

  // Verify reset password token
  async verifyResetPasswordToken(token: string): Promise<string> {
    // Hash token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const otpRecord = await prisma.oTP.findFirst({
      where: {
        code: hashedToken,
        purpose: OTPType.RESET_PASSWORD,
        usedOn: null,
      },
    });

    if (!otpRecord) {
      throw AppError.badRequest("Link đặt lại mật khẩu không hợp lệ", "INVALID_RESET_TOKEN");
    }

    // Check token expired
    if (otpRecord.expiresAt < new Date()) {
      throw AppError.badRequest("Link đặt lại mật khẩu đã hết hạn", "RESET_PASSWORD_EXPIRED");
    }

    const result = await prisma.oTP.updateMany({
      where: {
        id: otpRecord.id,
        usedOn: null,
      },
      data: {
        usedOn: new Date(),
      }
    });

    if (result.count === 0) {
      throw AppError.badRequest("Link đặt lại mật khẩu đã được sử dụng", "RESET_TOKEN_USED");
    }

    return otpRecord.userId;
  }
}

export default new OTPService();
