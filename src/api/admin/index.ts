import { Router } from "express";
import roomRoutes from "./room.route";
import { protect, isAdmin } from "../../middleware/auth.middleware";

const router = Router();

router.use(protect, isAdmin);

router.use("/rooms", roomRoutes);

export default router;
