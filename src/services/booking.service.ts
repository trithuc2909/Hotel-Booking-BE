import AppError from "../utils/appError";
import * as bookingDb from "../db/booking.db";
import { CreateBookingRequest } from "../types/request/booking";
import prisma from "../db/prisma";
import { normalizePhone } from "../utils/common";

export const upsertCustomer = async (userId: string): Promise<string> => {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: {
      fullName: true,
      phone: true,
      address: true,
      nationality: true,
      dateOfBirth: true,
    },
  });

  if (!profile)
    throw AppError.notFound("Chưa có hồ sơ người dùng", "PROFILE_NOT_FOUND");

  if (!profile.fullName || !profile.phone) {
    throw AppError.badRequest(
      "Vui lòng cập nhật họ tên và số điện thoại trước khi đặt phòng",
      "PROFILE_INCOMPLETE",
    );
  }

  const customer = await prisma.customer.upsert({
    where: { userId },
    update: {
      fullName: profile.fullName,
      phone: normalizePhone(profile.phone)!,
    },
    create: {
      userId,
      fullName: profile.fullName,
      phone: normalizePhone(profile.phone)!,
      address: profile.address,
      nationality: profile.nationality,
      dateOfBirth: profile.dateOfBirth,
    },
    select: { id: true },
  });

  return customer.id;
};

export const createBooking = async (data: CreateBookingRequest) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (data.rooms.length === 0) {
    throw AppError.badRequest("Phải chọn ít nhất 1 phòng", "NO_ROOMS");
  }
  if (data.checkInDate < today) {
    throw AppError.badRequest(
      "Ngày check-in không được trong quá khứ",
      "INVALID_CHECKIN",
    );
  }
  if (data.checkOutDate <= data.checkInDate) {
    throw AppError.badRequest(
      "Ngày check-out phải sau ngày check-in",
      "INVALID_CHECKOUT",
    );
  }

  const customerId = await upsertCustomer(data.userId!);

  return bookingDb.createBooking({...data, customerId});
};

export const getBookingById = async (bookingId: string, userId: string) => {
  const booking = await bookingDb.findBookingById(bookingId);

  if (!booking) {
    throw AppError.notFound("Không tìm thấy booking", "BOOKING_NOT_FOUND");
  }

  if (booking.userId !== userId) {
    throw AppError.forbidden(
      "Không có quyền truy cập booking này",
      "FORBIDDEN",
    );
  }

  return {
    id: booking.id,
    bookingCode: booking.bookingCode,
    status: booking.status,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    numberOfGuests: booking.numberOfGuests,
    totalNights: booking.totalNights,
    totalService: booking.totalService,
    taxAmount: booking.taxAmount,
    discount: booking.discount,
    totalAmount: booking.totalAmount,
    expiresAt: booking.expiresAt,
    rooms: booking.rooms,
    services: booking.services,
    payments: booking.payments?.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      paymentStatus: p.paymentStatus,
      payUrl: p.payUrl,
      paidAt: p.paidAt,
    })),
  };
};
