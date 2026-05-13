import cron from "node-cron";
import { BookingStatus } from "@prisma/client";
import prisma from "../db/prisma";
import logger from "../config/logger.config";

export const startBookingExpirationJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const result = await prisma.booking.updateMany({
        where: {
          status: BookingStatus.PENDING_PAYMENT,

          expiresAt: {
            lt: new Date(),
          },
        },

        data: {
          status: BookingStatus.EXPIRED,
        },
      });

      if (result.count > 0) {
        logger.info(`[CRON] Expired ${result.count} bookings`);
      }
    } catch (error) {
      logger.error("[CRON] Booking expiration job failed:", error);
    }
  });
};
