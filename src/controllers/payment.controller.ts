import { Request, Response } from "express";
import { ResponseHelper } from "../utils/response";
import { catchAsyncErrorWithCode } from "../utils/catchAsyncError";
import { matchedData } from "express-validator";
import * as paymentService from "../services/payment.service";
import { AuthenticatedUser } from "../types/request/base";
import { VNPayWebhookRequest } from "../types/request/vnpay";
import AppError from "../utils/appError";
import logger from "../config/logger.config";

export const initMomoPayment = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const { bookingId } = matchedData(req);

    const result = await paymentService.createMomoPayment(bookingId, user.id);

    res.json(ResponseHelper.success(result, "Khởi tạo thanh toán thành công"));
  },
  "INIT_MOMO_PAYMENT_ERROR",
);

export const momoWebhook = async (req: Request, res: Response) => {
  try {
    await paymentService.handleMomoWebhook(req.body);
  } catch (err) {
    console.error("Webhook error:", err);
  }

  res.status(200).json({ message: "OK" });
};

export const getPaymentStatus = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const { orderId } = matchedData(req, { locations: ["query"] });

    const result = await paymentService.getPaymentStatus(orderId, user.id);

    res.json(
      ResponseHelper.success(result, "Lấy trạng thái thanh toán thành công"),
    );
  },
  "GET_PAYMENT_STATUS_ERROR",
);

export const initVNPayPayment = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const user = req.user as AuthenticatedUser;
    const { bookingId } = matchedData(req);

    // Get client IP
    let ipAddr =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    if (ipAddr === "::1") ipAddr = "127.0.0.1";
    logger.info(`VNPAY IP Address: ${ipAddr}`);

    const result = await paymentService.createVNPayPayment(
      bookingId,
      user.id,
      ipAddr,
    );

    res.json(
      ResponseHelper.success(result, "Khởi tọa thanh toán VNPay thành công"),
    );
  },
  "INIT_VNPAY_PAYMENT_ERROR",
);

export const vnpayWebhook = async (req: Request, res: Response) => {
  try {
    const result = await paymentService.handleVNPayWebhook(
      req.query as unknown as VNPayWebhookRequest,
    );
    res.json(result);
  } catch (err) {
    console.error("VNPay webhook error:", err);
    res.json({ RspCode: "99", Message: "Unknown error" });
  }
};
