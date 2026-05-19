import { Router } from "express";
import * as dashboardController from "../../controllers/dashboard.controller";
import {
  getDashboardStatsValidation,
  getRoomTimelineValidation,
  handleValidationErrors,
} from "../../middleware/validation";

const router = Router();

router.get(
  "/stats",
  getDashboardStatsValidation,
  handleValidationErrors,
  dashboardController.getDashboardStats,
);

router.get(
  "/revenue-by-day",
  getDashboardStatsValidation,
  handleValidationErrors,
  dashboardController.getDailyRevenue,
);

router.get(
  "/room-timeline",
  getRoomTimelineValidation,
  handleValidationErrors,
  dashboardController.getRoomTimeline,
);

export default router;
