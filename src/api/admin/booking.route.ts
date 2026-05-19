import { Router } from "express";
import * as bookingController from "../../controllers/booking.controller";
import {
  getAdminBookingsValidation,
  handleValidationErrors,
} from "../../middleware/validation";

const router = Router();

router.get(
  "/",
  getAdminBookingsValidation,
  handleValidationErrors,
  bookingController.getAdminBookings,
);
router.get("/analytics", bookingController.getBookingAnalytics);
router.get("/export", bookingController.exportAdminBookings);

export default router;
