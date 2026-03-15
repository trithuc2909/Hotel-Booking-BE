import { Router } from "express";
import * as roomController from "../controllers/room.controller";
const router = Router();
/**
 * @route  GET /api/v1/rooms/featured
 * @desc   Lấy 4 phòng VIP tiêu biểu cho trang chủ
 * @access Public
 */
router.get("/featured-room", roomController.getFeaturedRooms);

export default router;