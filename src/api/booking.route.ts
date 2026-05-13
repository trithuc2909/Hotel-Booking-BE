import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import { protect, isUserOrAdmin } from "../middleware/auth.middleware";
import {
  cancelBookingValidation,
  createBookingValidation,
  getBookingHistoryValidation,
  handleValidationErrors,
  validateId,
} from "../middleware/validation";

const router = Router();

router.post(
  "/",
  protect,
  isUserOrAdmin,
  createBookingValidation,
  handleValidationErrors,
  bookingController.createBooking,
);
router.get(
  "/history",
  protect,
  getBookingHistoryValidation,
  handleValidationErrors,
  bookingController.getBookingHistory,
);
router.get(
  "/:id",
  protect,
  validateId,
  handleValidationErrors,
  bookingController.getBookingById,
);
router.post(
  "/:id/cancel",
  protect,
  cancelBookingValidation,
  handleValidationErrors,
  bookingController.cancelBooking,
);
export default router;
