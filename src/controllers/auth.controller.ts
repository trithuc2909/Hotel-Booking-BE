import {
  LoginRequest,
  RegisterRequest,
  ResendOTPRequest,
  VerifyOTPRequest,
} from "../types/request/auth";
import { BodyRequest } from "../types/request/base";
import { catchAsyncErrorWithCode } from "../utils/catchAsyncError";
import * as authService from "../services/auth.service";
import { NextFunction, Response, Request } from "express";
import { ResponseHelper } from "../utils/response";

export const signUpAccount = catchAsyncErrorWithCode(
  async (req: BodyRequest<RegisterRequest>, res: Response) => {
    const result = await authService.signUpAccount(req.body);
    res
      .status(201)
      .json(
        ResponseHelper.success(
          result,
          "Đăng ký tài khoản thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
          "REGISTER_SUCCESS",
        ),
      );
  },
  "REGISTER_ERROR",
);

export const loginAccount = catchAsyncErrorWithCode(
  async (req: BodyRequest<LoginRequest>, res: Response) => {
    const result = await authService.login(req.body);
    res
      .status(200)
      .json(
        ResponseHelper.success(
          result,
          "Đăng nhập tài khoản thành công",
          "LOGIN_SUCCESS",
        ),
      );
  },
  "LOGIN_ERROR",
);

export const verifyOTP = catchAsyncErrorWithCode(
  async (req: BodyRequest<VerifyOTPRequest>, res: Response) => {
    const { userId, otp } = req.body;

    const result = await authService.verifyRegistrationOTP(userId, otp);
    res
      .status(200)
      .json(
        ResponseHelper.success(
          result,
          "Xác thực tài khoản thành công",
          "VERIFY_OTP_SUCCESS",
        ),
      );
  },
  "VERIFY_OTP_ERROR",
);

export const resendOTP = catchAsyncErrorWithCode(
  async (req: BodyRequest<ResendOTPRequest>, res: Response) => {
    const { userId } = req.body;

    await authService.resendRegistrationOTP(userId);
    res
      .status(200)
      .json(
        ResponseHelper.success(
          null,
          "Mã OTP mới đã được gửi đến email của bạn",
          "RESEND_OTP_SUCCESS",
        ),
      );
  },
  "RESEND_OTP_ERROR",
);

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu."
    });
  } catch (error) {
    next(error);
  }
}

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    await authService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công."
    });
  } catch (error) {
    next(error);
  }
}