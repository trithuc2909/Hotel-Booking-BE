import { Router } from "express";
import authRoutes from "./auth.routes";
import roomRoutes from "./room.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);

export default router;
