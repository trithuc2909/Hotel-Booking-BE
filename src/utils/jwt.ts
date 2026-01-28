import jwt, { SignOptions } from "jsonwebtoken";
import config from "../config";
import { RefreshTokenResponse } from "../types/response/auth";
import prisma from "../db/prisma";
import { STATUS } from "../constant/status.constant";
import AppError from "./appError";

export const generateToken = (
  userId: string,
  username: string,
  email: string,
  role: string,
) => {
  const accessTokenOptions: SignOptions = {
    expiresIn: config.jwt.accessTokenExpiresIn,
  };
  const refreshTokenOptions: SignOptions = {
    expiresIn: config.jwt.refreshTokenExpiresIn,
  };

  // Access token
  const accessToken = jwt.sign(
    { userId, username, email, role },
    config.jwt.accessTokenSecretKey,
    accessTokenOptions,
  );

  const refreshToken = jwt.sign(
    { userId, username, email, role },
    config.jwt.refreshTokenSecretKey,
    refreshTokenOptions,
  );

  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<RefreshTokenResponse> => {
  try {
    // Veryfy refresh token
    const decoded = jwt.verify(
      refreshToken,
      config.jwt.refreshTokenSecretKey,
    ) as { userId: string; username: string; email: string; role: string };

    // find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status != STATUS.ACTIVE) {
      throw AppError.unauthorized(
        "Refresh token không hợp lệ",
        "INVALID_REFRESH_TOKEN",
      );
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      config.jwt.accessTokenSecretKey,
      { expiresIn: config.jwt.accessTokenExpiresIn },
    );

    return { accessToken: newAccessToken };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw AppError.unauthorized(
        "Refresh token đã hết hạn",
        "REFRESH_TOKEN_EXPIRED",
      );
    }

    throw AppError.unauthorized("Refresh token không hợp lệ", "INVALID_TOKEN");
  }
};
