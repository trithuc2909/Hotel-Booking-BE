import { Router } from "express";
import * as lookupController from "../controllers/lookup.controller";

const router = Router();

/**
 * @route  GET /api/v1/lookup/room-types
 * @desc   Lấy danh sách loại phòng
 * @access Public
 */
router.get("/room-types", lookupController.getRoomTypes);

/**
 * @route  GET /api/v1/lookup/amenities
 * @desc   Lấy danh sách tiện nghi
 * @access Public
 */
router.get("/amenities", lookupController.getAmenities);

export default router;
