import { BookingStatus, DiscountType, Prisma } from "@prisma/client";
import { CreateBookingRequest } from "../types/request/booking";
import prisma from "./prisma";
import AppError from "../utils/appError";
import { STATUS } from "../constant/status.constant";

const calculateNights = (checkIn: Date, checkOut: Date): number => {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.max(1, Math.ceil(ms / 86_400_000));
};

const generateBookingCode = async (
  tx: Prisma.TransactionClient,
): Promise<string> => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86_400_000);

  const count = await tx.booking.count({
    where: { createdOn: { gte: startOfDay, lt: endOfDay } },
  });

  return `BK-${dd}${mm}${yy}${String(count + 1).padStart(3, "0")}`;
};

export const createBooking = async (data: CreateBookingRequest) => {
  return prisma.$transaction(async (tx) => {
    const nights = calculateNights(data.checkInDate, data.checkOutDate);
    const roomIds = data.rooms.map((r) => r.roomId);

    // Conflict check in transaction
    const conflicts = await tx.bookingRoom.findMany({
      where: {
        roomId: { in: roomIds },
        booking: {
          status: {
            in: [
              BookingStatus.PENDING_PAYMENT,
              BookingStatus.CONFIRMED,
              BookingStatus.CHECKED_IN,
            ],
          },
          checkInDate: { lt: data.checkOutDate },
          checkOutDate: { gt: data.checkInDate },
        },
      },
      select: { roomId: true },
    });

    if (conflicts.length > 0) {
      throw AppError.conflict(
        "Một hoặc nhiều phòng đã được đặt trong khoảng thời gian này",
        "ROOM_OCCUPIED",
      );
    }

    const roomsFromDb = await tx.room.findMany({
      where: { id: { in: roomIds }, isDeleted: false },
      select: { id: true, roomName: true, basePrice: true },
    });

    if (roomsFromDb.length !== roomIds.length) {
      throw AppError.notFound(
        "Một hoặc nhiều phòng không tồn tại",
        "ROOM_NOT_FOUND",
      );
    }

    const roomMap = new Map(roomsFromDb.map((r) => [r.id, r]));

    let roomsTotal = 0;
    const roomsToCreate = data.rooms.map((r) => {
      const room = roomMap.get(r.roomId)!;
      const pricePerNight = Number(room.basePrice);

      roomsTotal += pricePerNight * nights;

      return {
        roomId: r.roomId,
        roomName: room.roomName,
        pricePerNight,
        nights,
      };
    });

    let servicesTotal = 0;
    const servicesToCreate: {
      serviceId: string;
      serviceName: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      totalPrice: number;
    }[] = [];

    const services = data.services ?? [];

    if (services.length > 0) {
      const serviceIds = services.map((s) => s.serviceId);
      const servicesFromDb = await tx.service.findMany({
        where: { id: { in: serviceIds }, status: "ACT" },
        select: { id: true, name: true, basePrice: true, unit: true },
      });

      if (servicesFromDb.length !== serviceIds.length) {
        throw AppError.notFound(
          "Một hoặc nhiều dịch vụ không tồn tại hoặc không còn hoạt động",
          "SERVICE_NOT_FOUND",
        );
      }

      const svcMap = new Map(servicesFromDb.map((s) => [s.id, s]));

      for (const s of data.services) {
        const dbSvc = svcMap.get(s.serviceId)!;
        const qty = Math.max(1, s.quantity);
        const unitPrice = Number(dbSvc.basePrice);
        const totalPrice = unitPrice * qty;
        servicesTotal += totalPrice;
        servicesToCreate.push({
          serviceId: s.serviceId,
          serviceName: dbSvc.name,
          quantity: qty,
          unit: dbSvc.unit,
          unitPrice,
          totalPrice,
        });
      }
    }

    let discount = 0;
    const subtotal = roomsTotal + servicesTotal;

    if (data.promotionId) {
      const now = new Date();
      const promo = await tx.promotion.findUnique({
        where: { id: data.promotionId },
      });

      const isValid =
        promo &&
        promo.status === STATUS.ACTIVE &&
        (!promo.startDate || promo.startDate <= now) &&
        (!promo.endDate || promo.endDate >= now) &&
        (!promo.minOrderValue || subtotal >= Number(promo.minOrderValue));

      if (isValid) {
        if (promo.discountType === DiscountType.FIXED) {
          discount = Number(promo.discountValue);
        } else {
          discount = Math.round((subtotal * Number(promo.discountValue)) / 100);
          if (promo.maxDiscount) {
            discount = Math.min(discount, Number(promo.maxDiscount));
          }
        }
      }
    }

    const taxAmount = Math.round(subtotal * 0.1);
    const totalAmount = Math.max(0, subtotal + taxAmount - discount);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const bookingCode = await generateBookingCode(tx);

    const finalCheck = await tx.bookingRoom.findFirst({
      where: {
        roomId: { in: roomIds },
        booking: {
          status: {
            in: [
              BookingStatus.PENDING_PAYMENT,
              BookingStatus.CONFIRMED,
              BookingStatus.CHECKED_IN,
            ],
          },
          checkInDate: { lt: data.checkOutDate },
          checkOutDate: { gt: data.checkInDate },
        },
      },
    });

    if (finalCheck)
      throw AppError.conflict(
        "Phòng vừa được đặt bởi người khác",
        "ROOM_RACE_CONDITION",
      );

    // Create booking
    return tx.booking.create({
      data: {
        bookingCode,
        customerId: data.customerId,
        userId: data.userId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        numberOfGuests: data.numberOfGuests,
        promotionId: data.promotionId,
        notes: data.notes,
        totalNights: nights,
        totalService: servicesTotal,
        taxAmount,
        discount,
        totalAmount,
        expiresAt,
        status: BookingStatus.PENDING_PAYMENT,
        rooms: { create: roomsToCreate },
        services: { create: servicesToCreate },
      },
    });
  });
};

export const findBookingById = async (id: string) => {
  return prisma.booking.findUnique({
    where: { id },
    include: { rooms: true, services: true, payments: true },
  });
};

export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus,
) => {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
};
