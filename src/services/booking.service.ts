import AppError from "../utils/appError";
import * as bookingDb from "../db/booking.db";
import { CreateBookingRequest } from "../types/request/booking";
import prisma from "../db/prisma";
import { normalizePhone } from "../utils/common";
import { BookingStatus } from "@prisma/client";
import { BOOKING_STATUS } from "../constant/booking.constant";
import { BookingHistoryResponse } from "../types/response/booking";

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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const customer = await prisma.customer.upsert({
    where: { userId },
    update: {
      fullName: profile.fullName,
      phone: normalizePhone(profile.phone)!,
      email: user?.email,
    },
    create: {
      userId,
      fullName: profile.fullName,
      phone: normalizePhone(profile.phone)!,
      email: user?.email,
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

  return bookingDb.createBooking({ ...data, customerId });
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

  return booking;
};

export const getBookingHistory = async (
  userId: string,
  status?: BookingStatus,
): Promise<BookingHistoryResponse[]> => {
  if (!userId) {
    throw AppError.unauthorized("Unauthorized");
  }

  const bookings = await bookingDb.findBookingsByUserId(userId, status);

  return bookings.map((b) => ({
    ...b,

    totalAmount: Number(b.totalAmount),

    rooms: b.rooms.map((r: any) => ({
      ...r,
      pricePerNight: Number(r.pricePerNight),
    })),

    services: b.services.map((s: any) => ({
      ...s,
      totalPrice: Number(s.totalPrice),
    })),

    latestPayment: b.latestPayment
      ? {
          ...b.latestPayment,
          amount: Number(b.latestPayment.amount),
        }
      : null,
  }));
};

export const cancelBooking = async (bookingId: string, userId: string) => {
  const booking = await bookingDb.findBookingById(bookingId);

  if (!booking) {
    throw AppError.notFound("Không tìm thấy booking", "BOOKING_NOT_FOUND");
  }

  if (booking.userId !== userId) {
    throw AppError.forbidden(
      "Không có quyền thực hiện hành động này",
      "FORBIDDEN",
    );
  }

  if (
    booking.status.code === BOOKING_STATUS.PENDING_PAYMENT &&
    booking.expiresAt &&
    booking.expiresAt < new Date()
  ) {
    await bookingDb.updateBookingStatus(bookingId, BookingStatus.EXPIRED);

    throw AppError.badRequest(
      "Booking đã hết hạn thanh toán",
      "BOOKING_EXPIRED",
    );
  }

  const CANCELLABLE: string[] = [
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.PENDING_PAYMENT,
  ];

  if (!CANCELLABLE.includes(booking.status.code)) {
    throw AppError.badRequest("Booking này không thể hủy", "CANNOT_CANCEL");
  }

  if (booking.status.code === BOOKING_STATUS.CONFIRMED) {
    const MS_PER_HOUR = 3_600_000;
    const HOURS_BEFORE_CANCEL = 48;

    const hoursUntilCheckIn =
      (new Date(booking.checkInDate).getTime() - Date.now()) / MS_PER_HOUR;

    if (hoursUntilCheckIn <= HOURS_BEFORE_CANCEL) {
      throw AppError.badRequest(
        "Chỉ được hủy trước ngày nhận phòng ít nhất 48 giờ",
        "CANCEL_TOO_LATE",
      );
    }
  }

  return bookingDb.updateBookingStatus(bookingId, BookingStatus.CANCELLED);
};
