import { Router } from "express";
import * as roomController from "../controllers/room.controller";
import {
  getAdminRoomsValidation,
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

router.get(
  "/:id",
  validateId,
  handleValidationErrors,
  roomController.getRoomById,
)

export default router;
