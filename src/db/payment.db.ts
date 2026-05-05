import { BookingStatus, PaymentStatus } from "@prisma/client";
import { CreatePaymentRequest } from "../types/request/payment";
import prisma from "./prisma";
import AppError from "../utils/appError";

export const createPayment = async (data: CreatePaymentRequest) => {
  return prisma.payment.create({
    data: {
      ...data,
      paymentStatus: PaymentStatus.PENDING,
    },
  });
};

export const findPaymentByOrderId = async (orderId: string) => {
  return prisma.payment.findUnique({
    where: { orderId },
    include: { booking: true },
  });
};

export const findPendingPaymentByBookingId = async (bookingId: string) => {
  return prisma.payment.findFirst({
    where: {
      bookingId,
      paymentStatus: PaymentStatus.PENDING,
      payUrl: { not: null },
    },
  });
};

export const updatePaymentSuccess = async (
  orderId: string,
  transactionId: string,
  rawResponse: string,
) => {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      throw AppError.notFound("Payment không tồn tại", "PAYMENT_NOT_FOUND");
    }

    if (payment.paymentStatus !== PaymentStatus.PENDING) {
      return payment;
    }

    const updatedPayment = await tx.payment.update({
      where: { orderId },
      data: {
        paymentStatus: PaymentStatus.SUCCESS,
        transactionId,
        rawResponse,
        paidAt: new Date(),
      },
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: BookingStatus.CONFIRMED },
    });

    return updatedPayment;
  });
};

export const updatePaymentFailed = async (
  orderId: string,
  rawResponse: string,
) => {
  return prisma.payment.update({
    where: { orderId },
    data: {
      paymentStatus: PaymentStatus.FAILED,
      rawResponse,
    },
  });
};
