import { Router } from "express";
import * as roomController from "../controllers/room.controller";
import {
  getRoomsValidation,
  handleValidationErrors,
  validateId,
} from "../middleware/validation";
const router = Router();

router.get(
  "/",
  getRoomsValidation,
  handleValidationErrors,
  roomController.getAllRooms,
);
router.get("/available", roomController.getAvailableRooms);
router.get(
  "/:id",
  validateId,
  handleValidationErrors,
  roomController.getRoomById,
);
router.get("/:id/availability", roomController.getOccupiedDateRangesForRoom);

export default router;
