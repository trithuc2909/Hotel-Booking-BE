import { Router } from "express";
import authRoutes from "./auth.route";
import roomRoutes from "./room.route";
import userRoutes from "./user.route";
import adminRoutes from "./admin";
import lookupRoutes from "./lookup.route";
import serviceRoutes from "./service.route";
import promotionRoutes from "./promotion.route";
import bookingRoutes from "./booking.route";
import paymentRoutes from "./payment.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
router.use("/lookup", lookupRoutes);
router.use("/services", serviceRoutes);
router.use("/promotions", promotionRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);

export default router;

