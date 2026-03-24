import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import * as userController from "../controllers/user.controller";

const router = Router();

router.get("/me", protect, userController.getMe);

export default router;