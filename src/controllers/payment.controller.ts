import { Request, Response } from "express";
import { ResponseHelper } from "../utils/response";
import { catchAsyncErrorWithCode } from "../utils/catchAsyncError";
import { matchedData } from "express-validator";
import * as paymentService from "../services/payment.service";
import { AuthenticatedUser } from "../types/request/base";
import { MomoWebHookRequest } from "../types/request/momo";

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
