import { Prisma } from "@prisma/client";
import prisma from "./prisma";
import { INVALID_BOOKING_STATUSES } from "../constant/booking.constant";
import { DailyRevenueResponse } from "../types/response/dashboard";
import { INVALID_STATUS_CODES } from "../constant/dashboard.constant";

const bookingStatsWhereClause = (
  startDate: Date,
  endDate: Date,
): Prisma.BookingWhereInput => ({
  checkInDate: {
    gte: startDate,
    lte: endDate,
  },
  status: {
    notIn: [...INVALID_BOOKING_STATUSES],
  },
});

export const getDashboardStats = async (startDate: Date, endDate: Date) => {
  const whereClause = bookingStatsWhereClause(startDate, endDate);

  const [bookingStats, avgRoomRateResult] = await prisma.$transaction([
    prisma.booking.aggregate({
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
      where: whereClause,
    }),

    prisma.$queryRaw<{ avgRate: Prisma.Decimal | null }[]>`
        SELECT AVG(br."pricePerNight") AS "avgRate"
        FROM booking_rooms br
        JOIN bookings b ON b.id = br."bookingId"
        WHERE b."checkInDate" >= ${startDate}
          AND b."checkInDate" <= ${endDate}
          AND b.status::text NOT IN (${Prisma.join(INVALID_STATUS_CODES)})
      `,
  ]);

  return {
    totalRevenue: bookingStats._sum.totalAmount?.toNumber() ?? 0,

    totalBookings: bookingStats._count.id ?? 0,

    avgRoomRate: avgRoomRateResult[0]?.avgRate?.toNumber() ?? 0,
  };
};

export const getDailyRevenue = async (startDate: Date, endDate: Date) => {
  const result = await prisma.$queryRaw<DailyRevenueResponse[]>`
    SELECT
      TO_CHAR(
        DATE_TRUNC('day', b."checkInDate"),
        'YYYY-MM-DD'
      ) AS "day",

      SUM(b."totalAmount") AS "revenue"

    FROM bookings b

    WHERE b."checkInDate" >= ${startDate}
      AND b."checkInDate" <= ${endDate}
      AND b.status::text NOT IN (${Prisma.join(INVALID_STATUS_CODES)})

    GROUP BY DATE_TRUNC('day', b."checkInDate")

    ORDER BY DATE_TRUNC('day', b."checkInDate") ASC
  `;

  return result.map((item) => ({
    day: item.day,
    revenue: Number(item.revenue),
  }));
};

export const getRoomTimeline = async (fromDate: Date, toDate: Date) => {
  const [rooms, bookings] = await prisma.$transaction([
    prisma.room.findMany({
      where: {
        isDeleted: false,
      },

      select: {
        id: true,
        roomNumber: true,

        roomType: {
          select: {
            name: true,
          },
        },
      },

      orderBy: [
        {
          roomType: {
            name: "asc",
          },
        },
        {
          roomNumber: "asc",
        },
      ],
    }),

    prisma.booking.findMany({
      where: {
        checkInDate: {
          lte: toDate,
        },

        checkOutDate: {
          gte: fromDate,
        },

        status: {
          notIn: [...INVALID_BOOKING_STATUSES],
        },
      },

      select: {
        bookingCode: true,
        checkInDate: true,
        checkOutDate: true,
        status: true,

        customer: {
          select: {
            fullName: true,
          },
        },

        rooms: {
          select: {
            roomId: true,
          },
        },
      },
    }),
  ]);

  const bookingMap = new Map<string, any[]>();

  for (const booking of bookings) {
    for (const bookedRoom of booking.rooms) {
      if (!bookingMap.has(bookedRoom.roomId)) {
        bookingMap.set(bookedRoom.roomId, []);
      }

      bookingMap.get(bookedRoom.roomId)?.push({
        guestName: booking.customer.fullName,
        bookingCode: booking.bookingCode,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        status: booking.status,
      });
    }
  }

  return rooms.map((room) => ({
    roomCode: room.roomNumber,

    roomType: room.roomType.name,

    bookings: bookingMap.get(room.id) ?? [],
  }));
};
