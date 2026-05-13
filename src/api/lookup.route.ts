import { Router } from "express";
import * as lookupController from "../controllers/lookup.controller";

const router = Router();

router.get("/room-types", lookupController.getRoomTypes);
router.get("/amenities", lookupController.getAmenities);
router.get("/codes", lookupController.getCodes);

export default router;
