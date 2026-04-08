import { query, ValidationChain } from "express-validator";

export const commonRoomQueryValidation: ValidationChain[] = [
  query("roomTypeCode")
    .optional()
    .isString()
    .trim()
    .customSanitizer((val) => val?.toUpperCase())
    .isIn(["VIP", "STD"])
    .withMessage("roomTypeCode phải là VIP hoặc STD"),
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
  query("pageNum").optional().isInt({ min: 1 }).toInt(),
  query("pageSize").optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const getRoomsValidation: ValidationChain[] = [
  ...commonRoomQueryValidation,
  query("guests").optional().isInt({ min: 1, max: 10 }).toInt(),
  query("checkIn").optional().isDate({ format: "YYYY-MM-DD" }),
  query("checkOut").optional().isDate({ format: "YYYY-MM-DD" }),
  query("minPrice").optional().isNumeric().toFloat(),
  query("maxPrice").optional().isNumeric().toFloat(),
];

export const getAdminRoomsValidation: ValidationChain[] = [
  ...commonRoomQueryValidation,
  query("status")
    .optional()
    .isIn(["AVL", "OCP", "CLN", "MNT", "RSV"])
    .withMessage("status không hợp lệ"),
  query("search")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("search tối đa 100 ký tự"),
];
