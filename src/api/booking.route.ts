import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import { protect, isUserOrAdmin } from "../middleware/auth.middleware";
import {
  createBookingValidation,
  handleValidationErrors,
  validateId,
} from "../middleware/validation";

const router = Router();

/**
 * @route  POST /api/v1/bookings
 * @desc   Tạo booking mới
 * @access Private (User | Admin)
 */
router.post(
  "/",
  protect,
  isUserOrAdmin,
  createBookingValidation,
  handleValidationErrors,
  bookingController.createBooking,
);

/**
 * @route  GET /api/v1/bookings/:id
 * @desc   Lấy thông tin booking theo ID
 * @access Private (Owner)
 */
router.get(
  "/:id",
  protect,
  validateId,
  handleValidationErrors,
  bookingController.getBookingById,
);

export default router;
