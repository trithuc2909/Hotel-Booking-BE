import { Router } from "express";
import * as roomController from "../controllers/room.controller";
import {
  getRoomsValidation,
  handleValidationErrors,
  validateId,
} from "../middleware/validation";
const router = Router();
/**
 * @route  GET /api/v1/rooms
 * @desc   Lấy danh sách phòng
 * @access Public
 */
router.get(
  "/",
  getRoomsValidation,
  handleValidationErrors,
  roomController.getAllRooms,
);

/**
 * @route  GET /api/v1/rooms/available
 * @desc   Lấy phòng khả dụng theo ngày và số khách (dùng cho gợi ý thêm phòng)
 * @access Public
 */
router.get("/available", roomController.getAvailableRooms);

router.get(
  "/:id",
  validateId,
  handleValidationErrors,
  roomController.getRoomById,
)

export default router;
