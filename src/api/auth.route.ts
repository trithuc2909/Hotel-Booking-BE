import { Router } from "express";
import {
  forgotPasswordValidation,
  handleValidationErrors,
  loginValidation,
  resendOTPValidation,
  resetPasswordValidation,
  signUpValidation,
  verifyOTPValidation,
} from "../middleware/validation";
import * as authController from "../controllers/auth.controller";

const router = Router();

router.post(
  "/sign-up",
  signUpValidation,
  handleValidationErrors,
  authController.signUpAccount,
);
/**
 * @route POST /api/v1/auth/login
 * @description Login account
 * @access Public
 */
router.post(
  "/login",
  loginValidation,
  handleValidationErrors,
  authController.loginAccount,
);

router.post(
  "/verify-otp",
  verifyOTPValidation,
  handleValidationErrors,
  authController.verifyOTP,
);

router.post(
  "/resend-otp",
  resendOTPValidation,
  handleValidationErrors,
  authController.resendOTP,
);

router.post(
  "/forgot-password",
  forgotPasswordValidation,
  handleValidationErrors,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  resetPasswordValidation,
  handleValidationErrors,
  authController.resetPassword
)

router.get("/validate-reset-token", authController.validateResetToken);

router.post("/refresh", authController.refreshToken);
export default router;
