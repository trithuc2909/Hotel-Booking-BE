import { Router } from "express";
import authRoutes from "./auth.route";
import roomRoutes from "./room.route";
import userRoutes from "./user.route";
import adminRoutes from "./admin";
import lookupRoutes from "./lookup.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
router.use("/lookup", lookupRoutes);

export default router;
