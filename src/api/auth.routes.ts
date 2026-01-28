import { Router } from "express";
import {
  handleValidationErrors,
  loginValidation,
  resendOTPValidation,
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

export default router;
