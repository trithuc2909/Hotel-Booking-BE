import { Router } from "express";
import * as roomController from "../controllers/room.controller";
import {
  getRoomsValidation,
  handleValidationErrors,
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

export default router;
