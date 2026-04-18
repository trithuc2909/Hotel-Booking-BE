import { Router } from "express";
import * as roomController from "../../controllers/room.controller";
import {
  createRoomValidation,
  getAdminRoomsValidation,
  handleValidationErrors,
  updateRoomValidation,
  validateId,
} from "../../middleware/validation";
import { uploadRoomImages } from "../../middleware/upload.middleware";

const router = Router();

router.get(
  "/",
  getAdminRoomsValidation,
  handleValidationErrors,
  roomController.getAdminRooms,
);

router.get(
  "/:id",
  validateId,
  handleValidationErrors,
  roomController.getAdminRoomById,
);

router.patch(
  "/:id/status",
  validateId,
  handleValidationErrors,
  roomController.updateRoomStatus,
);

router.patch(
  "/:id",
  validateId,
  uploadRoomImages,
  updateRoomValidation,
  handleValidationErrors,
  roomController.updateRoom,
);

router.delete(
  "/:id",
  validateId,
  handleValidationErrors,
  roomController.deleteRoomById,
);

router.post(
  "/",
  uploadRoomImages,
  createRoomValidation,
  handleValidationErrors,
  roomController.createRoom,
);

export default router;
