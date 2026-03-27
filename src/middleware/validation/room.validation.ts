import { query, ValidationChain } from "express-validator";

export const getRoomsValidation: ValidationChain[] = [
  query("roomTypeCode")
    .optional()
    .isString()
    .trim()
    .customSanitizer((val) => val?.toUpperCase())
    .isIn(["VIP", "STD"])
    .withMessage("roomTypeCode phải là VIP hoặc STD"),
  query("guests")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("guests phải là số nguyên từ 1 đến 10")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit phải là số nguyên từ 1 đến 100")
    .toInt(),
  query("checkIn")
    .optional()
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("checkIn phải đúng định dạng YYYY-MM-DD"),
  query("checkOut")
    .optional()
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("checkOut phải đúng định dạng YYYY-MM-DD"),
  query("minPrice")
    .optional()
    .isNumeric()
    .withMessage("minPrice phải là số")
    .toFloat(),
  query("maxPrice")
    .optional()
    .isNumeric()
    .withMessage("maxPrice phải là số")
    .toFloat(),
  query("sortBy")
    .optional()
    .isIn(["basePrice", "rating", "roomName", "createdOn"])
    .withMessage(
      "sortBy phải là một trong: basePrice, rating, roomName, createdOn",
    ),
  query("sortDirection")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("sortDirection phải là asc hoặc desc"),
  query("pageNum")
    .optional()
    .isInt({ min: 1 })
    .withMessage("pageNum phải là số nguyên >= 1")
    .toInt(),
  query("pageSize")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("pageSize phải là số nguyên từ 1-50")
    .toInt(),
];
