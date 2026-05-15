import { body, query } from "express-validator";
export const getAdminServicesValidation = [
  query("search").optional().isString().trim().isLength({ max: 100 }),
  query("categoryId").optional().isString().trim(),
  query("status")
    .optional()
    .isIn(["ACT", "INA"])
    .withMessage("status phải là ACT hoặc INA"),
  query("pageNum").optional().isInt({ min: 1 }).toInt(),
  query("pageSize").optional().isInt({ min: 1, max: 100 }).toInt(),
];
export const createServiceValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên dịch vụ không được để trống")
    .isLength({ min: 2, max: 100 })
    .withMessage("Tên dịch vụ từ 2 đến 100 ký tự"),
  body("serviceCategoryId")
    .notEmpty()
    .withMessage("Vui lòng chọn danh mục")
    .isString(),
  body("basePrice")
    .isFloat({ min: 0, max: 100_000_000 })
    .toFloat()
    .withMessage("Giá phải từ 0 đến 100 triệu"),
  body("unit")
    .trim()
    .notEmpty()
    .withMessage("Đơn vị không được để trống")
    .isLength({ max: 50 }),
  body("description").optional().trim().isString().isLength({ max: 500 }),
];
export const updateServiceValidation = [
  body("name").optional().trim().isLength({ min: 2, max: 100 }),
  body("serviceCategoryId").optional().isString(),
  body("basePrice").optional().isFloat({ min: 0, max: 100_000_000 }).toFloat(),
  body("unit").optional().trim().isLength({ max: 50 }),
  body("description").optional().trim().isString().isLength({ max: 500 }),
];
export const updateServiceStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Trạng thái không được để trống")
    .isIn(["ACT", "INA"])
    .withMessage("status phải là ACT hoặc INA"),
];
