import { Router } from "express";
import roomRoutes from "./room.route";
import serviceRoutes from "./service.route";
import { protect, isAdmin } from "../../middleware/auth.middleware";
import promotionRoutes from "./promotion.route";

const router = Router();

router.use(protect, isAdmin);

router.use("/rooms", roomRoutes);
router.use("/services", serviceRoutes);
router.use("/promotions", promotionRoutes);

export default router;
