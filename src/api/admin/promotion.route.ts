import { Router } from "express";
import * as promotionController from "../../controllers/promotion.controller";
import {
  getAdminPromotionsValidation,
  createPromotionValidation,
  updatePromotionValidation,
  updatePromotionStatusValidation,
  handleValidationErrors,
  validateId,
} from "../../middleware/validation";
import { uploadPromotionImage } from "../../middleware/upload.middleware";

const router = Router();

router.get("/stats", promotionController.getPromotionStats);
router.get(
  "/",
  getAdminPromotionsValidation,
  handleValidationErrors,
  promotionController.getAdminPromotions,
);
router.get(
  "/:id",
  validateId,
  handleValidationErrors,
  promotionController.getAdminPromotionById,
);

router.post(
  "/",
  uploadPromotionImage,
  createPromotionValidation,
  handleValidationErrors,
  promotionController.createPromotion,
);

router.patch(
  "/:id/status",
  validateId,
  updatePromotionStatusValidation,
  handleValidationErrors,
  promotionController.updatePromotionStatus,
);
router.patch(
  "/:id",
  validateId,
  uploadPromotionImage,
  updatePromotionValidation,
  handleValidationErrors,
  promotionController.updatePromotion,
);

router.delete(
  "/:id",
  validateId,
  handleValidationErrors,
  promotionController.deletePromotion,
);

export default router;
