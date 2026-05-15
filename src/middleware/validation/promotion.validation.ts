import { body, query } from "express-validator";

export const getAdminPromotionsValidation = [
  query("search").optional().isString().trim().isLength({ max: 100 }),
  query("status")
    .optional()
    .isIn(["ACT", "INA"])
    .withMessage("status phải là ACT hoặc INA"),
  query("discountType")
    .optional()
    .isIn(["FIXED", "PERCENT"])
    .withMessage("discountType phải là FIXED hoặc PERCENT"),
  query("pageNum").optional().isInt({ min: 1 }).toInt(),
  query("pageSize").optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const createPromotionValidation = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Mã ưu đãi không được để trống")
    .isLength({ max: 50 }),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Tiêu đề không được để trống")
    .isLength({ min: 2, max: 200 }),
  body("description").optional().trim().isString().isLength({ max: 1000 }),
  body("discountType")
    .isIn(["FIXED", "PERCENT"])
    .withMessage("discountType phải là FIXED hoặc PERCENT"),
  body("discountValue")
    .isFloat({ min: 0 })
    .toFloat()
    .withMessage("Giá trị giảm phải >= 0"),
  body("minOrderValue").optional().isFloat({ min: 0 }).toFloat(),
  body("maxDiscount").optional().isFloat({ min: 0 }).toFloat(),
  body("startDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("startDate không hợp lệ"),
  body("endDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("endDate không hợp lệ"),
  body("usageLimit").optional().isInt({ min: 1 }).toInt(),
  body("maxUsagePerUser").optional().isInt({ min: 1 }).toInt(),
];

export const updatePromotionValidation = [
  body("code").optional().trim().isLength({ max: 50 }),
  body("title").optional().trim().isLength({ min: 2, max: 200 }),
  body("description").optional().trim().isString().isLength({ max: 1000 }),
  body("discountType").optional().isIn(["FIXED", "PERCENT"]),
  body("discountValue").optional().isFloat({ min: 0 }).toFloat(),
  body("minOrderValue").optional().isFloat({ min: 0 }).toFloat(),
  body("maxDiscount").optional().isFloat({ min: 0 }).toFloat(),
  body("startDate").optional().isISO8601().toDate(),
  body("endDate").optional().isISO8601().toDate(),
  body("usageLimit").optional().isInt({ min: 1 }).toInt(),
  body("maxUsagePerUser").optional().isInt({ min: 1 }).toInt(),
];

export const updatePromotionStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Trạng thái không được để trống")
    .isIn(["ACT", "INA"])
    .withMessage("status phải là ACT hoặc INA"),
];
