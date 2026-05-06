import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import { protect, isUserOrAdmin } from "../middleware/auth.middleware";
import {
  initPaymentValidation,
  getPaymentStatusValidation,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();

router.post(
  "/momo",
  protect,
  isUserOrAdmin,
  initPaymentValidation,
  handleValidationErrors,
  paymentController.initMomoPayment,
);
router.post("/momo/webhook", paymentController.momoWebhook);
router.get(
  "/status",
  protect,
  getPaymentStatusValidation,
  handleValidationErrors,
  paymentController.getPaymentStatus,
);

router.post(
  "/vnpay",
  protect,
  isUserOrAdmin,
  initPaymentValidation,
  handleValidationErrors,
  paymentController.initVNPayPayment,
);
router.get("/vnpay/webhook", paymentController.vnpayWebhook);

export default router;
