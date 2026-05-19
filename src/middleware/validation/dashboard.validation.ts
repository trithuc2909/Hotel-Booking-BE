import { query } from "express-validator";
import { DASHBOARD_STATS_PERIOD } from "../../types/request/dashboard";

export const getDashboardStatsValidation = [
  query("period")
    .optional()
    .isIn(Object.values(DASHBOARD_STATS_PERIOD))
    .withMessage("Period phải là current hoặc previous"),
  query("month")
    .optional()
    .matches(/^\d{4}-\d{2}$/)
    .withMessage("Month phải có định dạng YYYY-MM"),
];

export const getRoomTimelineValidation = [
  query("from")
    .notEmpty()
    .withMessage("Vui lòng cung cấp ngày bắt đầu (from)")
    .isISO8601()
    .withMessage("Ngày bắt đầu không đúng định dạng YYYY-MM-DD"),
  query("to")
    .notEmpty()
    .withMessage("Vui lòng cung cấp ngày kết thúc (to)")
    .isISO8601()
    .withMessage("Ngày kết thúc không đúng định dạng YYYY-MM-DD")
    .custom((to, { req }) => {
      const from = req.query?.from;
      if (from && new Date(from) > new Date(to)) {
        throw new Error("Ngày kết thúc phải sau ngày bắt đầu");
      }
      return true;
    }),
];
