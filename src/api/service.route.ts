import { Router } from "express";
import * as serviceController from "../controllers/service.controller";

const router = Router();

router.get("/", serviceController.getAllServices);

router.get("/categories", serviceController.getAllServiceCategories);

export default router;
