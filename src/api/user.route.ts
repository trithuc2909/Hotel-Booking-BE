import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import * as userController from "../controllers/user.controller";
import { uploadSingleImage } from "../middleware/upload.middleware";
import {
  changePasswordValidation,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();

router.get("/me", protect, userController.getMe);
router.patch("/profile", protect, userController.updateUserProfile);
router.post(
  "/profile/avatar",
  protect,
  uploadSingleImage,
  userController.uploadUserAvatar,
);
router.patch(
  "/password",
  protect,
  changePasswordValidation,
  handleValidationErrors,
  userController.changePassword,
);

export default router;
