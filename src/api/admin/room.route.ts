import { Router } from "express";
import * as roomController from "../../controllers/room.controller";
import {
  getAdminRoomsValidation,
  //   createRoomValidation,
  //   updateRoomValidation,
  handleValidationErrors,
  validateId,
} from "../../middleware/validation";

const router = Router();

router.get(
  "/",
  getAdminRoomsValidation,
  handleValidationErrors,
  roomController.getAdminRooms,
);

export default router;
