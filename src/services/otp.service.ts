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
}

export default new OTPService();
