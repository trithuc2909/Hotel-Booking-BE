import { body, query, ValidationChain } from "express-validator";

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

export const createRoomValidation: ValidationChain[] = [
  body("roomName")
    .trim()
    .notEmpty()
    .withMessage("Tên phòng không được để trống")
    .isLength({ min: 3, max: 100 })
    .withMessage("Tên phòng từ 3 đến 100 ký tự"),
  body("roomNumber")
    .trim()
    .notEmpty()
    .matches(/^\d{3}$/)
    .withMessage("Mã phòng phải là 3 chữ số"),
  body("roomTypeId")
    .notEmpty()
    .withMessage("Vui lòng chọn loại phòng")
    .isString(),
  body("basePrice")
    .isFloat({ min: 0, max: 100_000_000 })
    .toFloat()
    .withMessage("Giá phòng phải từ 0 đến 100 triệu"),
  body("floor")
    .isInt({ min: 1, max: 10 })
    .toInt()
    .withMessage("Tầng phải từ 1 đến 10"),
  body("maxGuests")
    .isInt({ min: 1, max: 10 })
    .toInt()
    .withMessage("Số khách từ 1 đến 10"),
  body("balcony").optional().isBoolean().toBoolean(),
  body("size")
    .optional()
    .isFloat({ min: 10, max: 200 })
    .toFloat()
    .withMessage("Diện tích từ 10 đến 200 m²"),
  body("bedType").optional().trim().isString().isLength({ max: 50 }),
  body("view").optional().trim().isString().isLength({ max: 50 }),
  body("description").optional().trim().isString().isLength({ max: 1000 }),
  body("notes").optional().trim().isString().isLength({ max: 255 }),
  body("amenityIds")
    .optional()
    .customSanitizer((val) => {
      if (!val) return [];
      if (typeof val === "string") return [val];
      return Array.isArray(val) ? val : [];
    })
    .isArray({ max: 20 })
    .withMessage("Tối đa 20 tiện nghi"),
];

export const updateRoomValidation: ValidationChain[] = [
  body("roomName")
    .trim()
    .notEmpty()
    .withMessage("Tên phòng không được để trống")
    .isLength({ min: 3, max: 100 })
    .withMessage("Tên phòng từ 3 đến 100 ký tự"),
  body("roomNumber")
    .trim()
    .notEmpty()
    .matches(/^\d{3}$/)
    .withMessage("Mã phòng phải là 3 chữ số"),
  body("roomTypeId")
    .notEmpty()
    .withMessage("Vui lòng chọn loại phòng")
    .isString(),
  body("basePrice")
    .isFloat({ min: 0, max: 100_000_000 })
    .toFloat()
    .withMessage("Giá phòng phải từ 0 đến 100 triệu"),
  body("floor")
    .isInt({ min: 1, max: 10 })
    .toInt()
    .withMessage("Tầng phải từ 1 đến 10"),
  body("maxGuests")
    .isInt({ min: 1, max: 10 })
    .toInt()
    .withMessage("Số khách từ 1 đến 10"),
  body("balcony").optional().isBoolean().toBoolean(),
  body("size")
    .optional()
    .isFloat({ min: 10, max: 200 })
    .toFloat()
    .withMessage("Diện tích từ 10 đến 200 m²"),
  body("bedType").optional().trim().isString().isLength({ max: 50 }),
  body("view").optional().trim().isString().isLength({ max: 50 }),
  body("description").optional().trim().isString().isLength({ max: 1000 }),
  body("notes").optional().trim().isString().isLength({ max: 255 }),
  body("amenityIds")
    .optional()
    .customSanitizer((val) => {
      if (!val) return [];
      if (typeof val === "string") return [val];
      return Array.isArray(val) ? val : [];
    })
    .isArray({ max: 20 })
    .withMessage("Tối đa 20 tiện nghi"),
  body("deleteImageIds")
    .optional()
    .customSanitizer((val) => {
      if (!val) return [];
      if (typeof val === "string") return [val];
      return Array.isArray(val) ? val : [];
    })
    .isArray({ max: 4 }),
];
