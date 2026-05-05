import { BookingStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import AppError from "../utils/appError";
import * as bookingDb from "../db/booking.db";
import * as paymentDb from "../db/payment.db";
import * as momoService from "./momo.service";
import { MomoWebHookRequest } from "../types/request/momo";
import config from "../config";

export const createMomoPayment = async (bookingId: string, userId: string) => {
  const booking = await bookingDb.findBookingById(bookingId);
  const now = new Date();

  if (!booking) {
    throw AppError.notFound("Không tìm thấy booking", "BOOKING_NOT_FOUND");
  }

  if (booking.userId !== userId) {
    throw AppError.forbidden("Không có quyền truy cập", "FORBIDDEN");
  }

  if (booking.status !== BookingStatus.PENDING_PAYMENT) {
    throw AppError.badRequest(
      "Booking không ở trạng thái chờ thanh toán",
      "INVALID_BOOKING_STATUS",
    );
  }

  // Expired
  if (booking.expiresAt && booking.expiresAt < now) {
    await bookingDb.updateBookingStatus(bookingId, BookingStatus.EXPIRED);
    throw new AppError("Booking đã hết hạn thanh toán, vui lòng đặt lại", 410);
  }

  // Check payment pending
  const existingPending =
    await paymentDb.findPendingPaymentByBookingId(bookingId);
  if (existingPending) {
    return {
      payUrl: existingPending.payUrl,
      orderId: existingPending.orderId,
    };
  }

  const orderId = `${booking.bookingCode}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;

  if (process.env.MOCK_MOMO === "true") {
    const payUrl = `https://test-payment.momo.vn/gw_payment/transactionProcessor?orderId=${orderId}`;
    await paymentDb.createPayment({
      bookingId,
      orderId,
      amount: Number(booking.totalAmount),
      paymentMethod: PaymentMethod.MOMO,
      payUrl,
    });
    return { payUrl, orderId };
  }

  const momoRes = await momoService.createMomoPayment({
    orderId,
    amount: Number(booking.totalAmount),
    orderInfo: `Thanh toán đặt phòng ${booking.bookingCode}`,
    redirectUrl: `${config.momo.redirectUrl}?bookingId=${bookingId}`,
  });

  if (momoRes.resultCode !== 0) {
    throw new AppError(
      `Khởi tạo thanh toán MoMo thất bại: ${momoRes.message}`,
      502,
    );
  }

  await paymentDb.createPayment({
    bookingId,
    orderId,
    amount: Number(booking.totalAmount),
    paymentMethod: PaymentMethod.MOMO,
    payUrl: momoRes.payUrl,
  });

  return { payUrl: momoRes.payUrl, orderId };
};

export const handleMomoWebhook = async (request: MomoWebHookRequest) => {
  // Verify HMAC signature
  // const isValid = momoService.verifySignature(request);
  // if (!isValid) {
  //   throw AppError.badRequest("Chữ ký không hợp lệ", "INVALID_SIGNATURE");
  // }

  if (process.env.MOCK_MOMO !== "true") {
    const isValid = momoService.verifySignature(request);
    if (!isValid) {
      throw AppError.badRequest("Chữ ký không hợp lệ", "INVALID_SIGNATURE");
    }
  }

  // Find payment record
  const payment = await paymentDb.findPaymentByOrderId(request.orderId);
  if (!payment) {
    throw AppError.notFound("Không tìm thấy thanh toán", "PAYMENT_NOT_FOUND");
  }

  // Idempotency
  if (payment.paymentStatus !== PaymentStatus.PENDING) {
    return { message: "Already processed" };
  }

  // Verify amount
  if (Number(request.amount) !== Number(payment.amount)) {
    throw AppError.badRequest("Số tiền không hợp lệ!", "INVALID_AMOUNT");
  }

  // Check payment valid
  if (payment.booking?.status !== BookingStatus.PENDING_PAYMENT) {
    return { message: "Booking không hợp lệ" };
  }

  const rawResponse = JSON.stringify(request);

  if (request.resultCode === 0) {
    // Payment success
    await paymentDb.updatePaymentSuccess(
      request.orderId,
      String(request.transId),
      rawResponse,
    );
  } else {
    // Payment failed
    await paymentDb.updatePaymentFailed(request.orderId, rawResponse);
  }

  return { message: "OK" };
};

export const getPaymentStatus = async (orderId: string, userId: string) => {
  const payment = await paymentDb.findPaymentByOrderId(orderId);

  if (!payment) {
    throw AppError.notFound("Không tìm thấy thanh toán", "PAYMENT_NOT_FOUND");
  }

  // Verify ownership
  if (payment.booking?.userId !== userId) {
    throw AppError.forbidden("Không có quyền truy cập", "FORBIDDEN");
  }

  return {
    orderId: payment.orderId,
    paymentStatus: payment.paymentStatus,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    transactionId: payment.transactionId,
    paidAt: payment.paidAt,
    bookingId: payment.bookingId,
    bookingCode: payment.booking?.bookingCode,
    bookingStatus: payment.booking?.status,
  };
};
