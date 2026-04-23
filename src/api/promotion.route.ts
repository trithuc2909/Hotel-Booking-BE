import { Router } from "express";
import * as promotionController from "../controllers/promotion.controller";

const router = Router();

router.get("/", promotionController.getAllPromotions);

export default router;
