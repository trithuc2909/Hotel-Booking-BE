import { BookingStatus, DiscountType, Prisma } from "@prisma/client";
import { CreateBookingRequest } from "../types/request/booking";
import prisma from "./prisma";
import AppError from "../utils/appError";
import { STATUS } from "../constant/status.constant";
import {
  BOOKING_STATUS,
  BOOKING_STATUS_HOLDS_ROOM,
} from "../constant/booking.constant";

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
  return prisma.$transaction(
    async (tx) => {
      const nights = calculateNights(data.checkInDate, data.checkOutDate);
      const roomIds = data.rooms.map((r) => r.roomId);

      // Conflict check in transaction
      const conflicts = await tx.$queryRaw<{ roomId: string }[]>`
        SELECT br."roomId"
        FROM booking_rooms br
        JOIN bookings b ON b.id = br."bookingId"
        WHERE br."roomId" IN (${Prisma.join(roomIds)})
          AND b.status::text = ANY(ARRAY[${Prisma.raw(
            BOOKING_STATUS_HOLDS_ROOM.map((s) => `'${s}'`).join(","),
          )}]::text[])
          AND b."checkInDate" < ${data.checkOutDate}
          AND b."checkOutDate" > ${data.checkInDate}
      `;

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
            discount = Math.round(
              (subtotal * Number(promo.discountValue)) / 100,
            );
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

      const finalCheck = await tx.$queryRaw<{ roomId: string }[]>`
        SELECT br."roomId"
        FROM booking_rooms br
        JOIN bookings b ON b.id = br."bookingId"
        WHERE br."roomId" IN (${Prisma.join(roomIds)})
          AND b.status::text = ANY(ARRAY[${Prisma.raw(
            BOOKING_STATUS_HOLDS_ROOM.map((s) => `'${s}'`).join(","),
          )}]::text[])
          AND b."checkInDate" < ${data.checkOutDate}
          AND b."checkOutDate" > ${data.checkInDate}
        LIMIT 1
      `;

      if (finalCheck.length > 0)
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
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
};

export const findBookingById = async (id: string) => {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT
      b.id,
      b."bookingCode",
      b."userId",
      b."customerId",
      b."checkInDate",
      b."checkOutDate",
      b."numberOfGuests",
      b."totalNights",
      b."totalService",
      b."taxAmount",
      b.discount,
      b."totalAmount",
      b."promotionId",
      b.notes,
      b."expiresAt",
      b."createdOn",
      json_build_object(
        'code', c.code,
        'displayAs', c."displayAs"
      ) as status,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', br.id,
              'roomId', br."roomId",
              'roomName', br."roomName",
              'pricePerNight', br."pricePerNight",
              'nights', br.nights,
              'thumbnailUrl', r."thumbnailUrl"
            )
          )
          FROM booking_rooms br
          LEFT JOIN rooms r ON r.id = br."roomId"
          WHERE br."bookingId" = b.id
        ),
        '[]'::json
      ) as rooms,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', bs.id,
              'serviceId', bs."serviceId",
              'serviceName', bs."serviceName",
              'quantity', bs.quantity,
              'unit', bs.unit,
              'unitPrice', bs."unitPrice",
              'totalPrice', bs."totalPrice"
            )
          )
          FROM booking_services bs
          WHERE bs."bookingId" = b.id
        ),
        '[]'::json
      ) as services,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', p.id,
              'orderId', p."orderId",
              'amount', p.amount,
              'paymentMethod', p."paymentMethod",
              'paymentStatus', p."paymentStatus",
              'payUrl', p."payUrl",
              'paidAt', p."paidAt"
            )
            ORDER BY p."createdOn" DESC
          )
          FROM payments p
          WHERE p."bookingId" = b.id
        ),
        '[]'::json
      ) as payments,

      (
        SELECT json_build_object(
          'fullName', cu."fullName",
          'phone', cu.phone,
          'email', cu.email
        )
        FROM customers cu
        WHERE cu.id = b."customerId"
      ) as customer

    FROM bookings b

    LEFT JOIN codes c
      ON c.code = b.status::text
      AND c.type = 'BOOKING_STATUS'

    WHERE b.id = ${id}
    LIMIT 1
  `;

  if (rows.length === 0) return null;

  const b = rows[0];
  return {
    ...b,
    totalService: Number(b.totalService),
    taxAmount: Number(b.taxAmount),
    discount: Number(b.discount),
    totalAmount: Number(b.totalAmount),
    rooms: (b.rooms ?? []).map((r: any) => ({
      ...r,
      pricePerNight: Number(r.pricePerNight),
    })),
    services: (b.services ?? []).map((s: any) => ({
      ...s,
      unitPrice: Number(s.unitPrice),
      totalPrice: Number(s.totalPrice),
    })),
    payments: (b.payments ?? []).map((p: any) => ({
      ...p,
      amount: Number(p.amount),
    })),
  };
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

export const findBookingsByUserId = async (
  userId: string,
  status?: BookingStatus,
) => {
  return prisma.$queryRaw<any[]>`
    SELECT
      b.id,
      b."bookingCode",
      json_build_object(
        'code', c.code,
        'displayAs', c."displayAs"
      ) as status,
      b."checkInDate",
      b."checkOutDate",
      b."totalNights",
      b."totalAmount",
      b."createdOn",
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'roomId', br."roomId",
              'roomName', br."roomName",
              'pricePerNight', br."pricePerNight",
              'nights', br.nights,
              'thumbnailUrl', r."thumbnailUrl"
            )
          )
          FROM booking_rooms br
          LEFT JOIN rooms r ON r.id = br."roomId"
          WHERE br."bookingId" = b.id
        ),
        '[]'::json
      ) as rooms,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'serviceName', bs."serviceName",
              'quantity', bs.quantity,
              'unit', bs.unit,
              'totalPrice', bs."totalPrice"
            )
          )
          FROM booking_services bs
          WHERE bs."bookingId" = b.id
        ),
        '[]'::json
      ) as services,
      (
        SELECT json_build_object(
          'paymentStatus', p."paymentStatus",
          'paymentMethod', p."paymentMethod",
          'paidAt', p."paidAt",
          'amount', p.amount
        )
        FROM payments p
        WHERE p."bookingId" = b.id
        ORDER BY p."createdOn" DESC
        LIMIT 1
      ) as "latestPayment"

    FROM bookings b
    LEFT JOIN codes c
      ON c.code = b.status::text
      AND c.type = 'BOOKING_STATUS'
    WHERE b."userId" = ${userId} AND b.status::text != ${BOOKING_STATUS.EXPIRED}
    ${status ? Prisma.sql`AND b.status::text = ${status}` : Prisma.empty}

    ORDER BY b."createdOn" DESC
  `;
};
