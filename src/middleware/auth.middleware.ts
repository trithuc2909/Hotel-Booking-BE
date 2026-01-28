import { Request, Response, NextFunction } from "express";
import { ResponseHelper } from "../utils/response";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import prisma from "../db/prisma";
import { STATUS } from "../constant/status.constant";
import { AuthenticatedUser } from "../types/request/base";
import { ROLE } from "../constant/role.constant";

// Protect Middleware - Xác thực jwt token header và cookies
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  let token: string | undefined;

  // Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // If no token in header, check cookies
  if (!token && req.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  // Token not found
  if (!token) {
    res
      .status(401)
      .json(ResponseHelper.error("Token không được cung cấp", "NO_TOKEN"));
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      config.jwt.accessTokenSecretKey,
    ) as JwtPayload & {
      userId: string;
      username: string;
      email: string;
      role: string;
    };

    // Check user exists and active
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

    if (!user) {
      res
        .status(401)
        .json(
          ResponseHelper.error("Người dùng không tồn tại", "USER_NOT_FOUND"),
        );
      return;
    }

    if (user.status !== STATUS.ACTIVE) {
      res
        .status(403)
        .json(
          ResponseHelper.error(
            "Tài khoản đã bị khóa hoặc chưa được kích hoạt",
            "ACCOUNT_INACTIVE",
          ),
        );
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    } as AuthenticatedUser;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res
        .status(401)
        .json(ResponseHelper.error("Token đã hết hạn", "TOKEN_EXPIRED"));
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res
        .status(401)
        .json(ResponseHelper.error("Token không hợp lệ", "TOKEN_INVALID"));
      return;
    }

    res
      .status(500)
      .json(ResponseHelper.error("Lỗi xác thực", "AUTHENTICATION_ERROR"));
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res
        .status(401)
        .json(ResponseHelper.error("Chưa xác thực", "UNAUTHORIZED"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res
        .status(403)
        .json(ResponseHelper.error("Bạn không có quyền truy cập", "FORBIDDEN"));
      return;
    }

    next();
  };
};

// Admin Only Middleware
export const isAdmin = authorize(ROLE.ADMIN);

// User Only Middleware
export const isUserOrAdmin = authorize(ROLE.USER, ROLE.ADMIN);
