import config from "../config";
import crypto from "crypto";
import prisma from "../db/prisma";
import emailService from "./email.service";
import bcrypt from "bcryptjs";
import { OTPType } from "@prisma/client";
import AppError from "../utils/appError";

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
    // Delete old OTP
    await prisma.oTP.deleteMany({
      where: {
        userId,
        purpose: "REGISTER",
        usedOn: null,
      },
    });

    // Generate OTP code
    const otpCode = this.generateOTPCode();

    // Hash OTP code
    const hasedCode = await bcrypt.hash(otpCode, 10);

    // Calculate OTP expires time
    const expiresAt = new Date(
      Date.now() + config.otp.expiresMinutes * 60 * 1000,
    );

    // create OTP
    await prisma.oTP.create({
      data: {
        userId,
        code: hasedCode,
        purpose: OTPType.REGISTER,
        expiresAt,
      },
    });

    // Send OTP to email
    await emailService.sendRegistrationOTP(email, username, otpCode);
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

    if (otps.length === 0) {
      throw AppError.validation(
        "Mã OTP không hợp lệ hoặc đã hết hạn",
        "INVALID_OTP",
      );
    }

    // Find OTP match
    let matchOTP = null;
    for (const otp of otps) {
      const isMatch = await bcrypt.compare(code, otp.code);
      if (isMatch) {
        matchOTP = otp;
        break;
      }
    }

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
}

export default new OTPService();
