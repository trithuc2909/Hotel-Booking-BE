import { Router } from "express";
import * as promotionController from "../controllers/promotion.controller";
import { protect, isUserOrAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", promotionController.getAllPromotions);
router.get(
  "/validate",
  protect,
  isUserOrAdmin,
  promotionController.validatePromoCode,
);

export default router;
