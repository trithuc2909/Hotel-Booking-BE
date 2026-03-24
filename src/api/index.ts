import { Router } from "express";
import authRoutes from "./auth.route";
import roomRoutes from "./room.route";
import userRoutes from "./user.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);
router.use("/users", userRoutes);

export default router;
