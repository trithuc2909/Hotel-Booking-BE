import cron from "node-cron";
import { BookingStatus } from "@prisma/client";
import prisma from "../db/prisma";
import logger from "../config/logger.config";
import { ROOM_STATUS } from "../constant/room.constant";

export const startBookingAutoCheckoutJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const now = new Date();

      const overdueBookings = await prisma.booking.findMany({
        where: {
          status: BookingStatus.CHECKED_IN,
          checkOutDate: { lt: now },
        },
        include: {
          rooms: {
            select: { roomId: true },
          },
        },
      });

      if (overdueBookings.length === 0) return;

      for (const booking of overdueBookings) {
        const roomIds = booking.rooms.map((r) => r.roomId);

        await prisma.$transaction([
          prisma.booking.update({
            where: { id: booking.id },
            data: {
              status: BookingStatus.CHECKED_OUT,
              actualCheckOutDate: now,
            },
          }),

          prisma.room.updateMany({
            where: { id: { in: roomIds } },
            data: { status: ROOM_STATUS.CLEANING },
          }),
        ]);
      }

      logger.info(`[CRON] Auto checkout ${overdueBookings.length} bookings`);
    } catch (error) {
      logger.error("[CRON] Booking auto checkout job failed:", error);
    }
  });
};
