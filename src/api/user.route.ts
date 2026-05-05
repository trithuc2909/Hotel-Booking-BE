import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import * as userController from "../controllers/user.controller";

const router = Router();

router.get("/me", protect, userController.getMe);
router.patch("/profile", protect, userController.updateUserProfile);

export default router;
