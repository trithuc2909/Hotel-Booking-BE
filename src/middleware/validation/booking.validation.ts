import { body, param, query } from "express-validator";

export const createBookingValidation = [
  body("checkInDate")
    .notEmpty().withMessage("checkInDate không được để trống")
    .isISO8601().withMessage("checkInDate phải là định dạng ngày hợp lệ (ISO8601)"),

  body("checkOutDate")
    .notEmpty().withMessage("checkOutDate không được để trống")
    .isISO8601().withMessage("checkOutDate phải là định dạng ngày hợp lệ (ISO8601)"),

  body("numberOfGuests")
    .notEmpty().withMessage("numberOfGuests không được để trống")
    .isInt({ min: 1 }).withMessage("numberOfGuests phải là số nguyên >= 1"),

  body("rooms")
    .isArray({ min: 1 }).withMessage("Phải chọn ít nhất 1 phòng"),

  body("rooms.*.roomId")
    .notEmpty().withMessage("roomId không được để trống")
    .isString().withMessage("roomId phải là chuỗi")
    .trim(),

  body("services")
    .optional()
    .isArray().withMessage("services phải là mảng"),

  body("services.*.serviceId")
    .if(body("services").isArray({ min: 1 }))
    .notEmpty().withMessage("serviceId không được để trống")
    .isString().withMessage("serviceId phải là chuỗi"),

  body("services.*.quantity")
    .if(body("services").isArray({ min: 1 }))
    .isInt({ min: 1 }).withMessage("quantity phải là số nguyên >= 1"),

  body("promotionId")
    .optional()
    .isString().withMessage("promotionId phải là chuỗi")
    .trim(),

  body("notes")
    .optional()
    .isString().withMessage("notes phải là chuỗi")
    .isLength({ max: 500 }).withMessage("notes tối đa 500 ký tự")
    .trim(),
];

export const initPaymentValidation = [
  body("bookingId")
    .notEmpty().withMessage("bookingId không được để trống")
    .isString().withMessage("bookingId phải là chuỗi")
    .trim(),
];

export const getPaymentStatusValidation = [
  query("orderId")
    .notEmpty().withMessage("orderId không được để trống")
    .isString().withMessage("orderId phải là chuỗi"),
];

export const getBookingHistoryValidation = [
  query("status")
    .optional()
    .isString().withMessage("status phải là chuỗi")
    .isIn(["PND", "PPY", "CFM", "CHK", "CKO", "CAN", "NSW", "EXP"])
    .withMessage("status không hợp lệ"),
];

export const cancelBookingValidation = [
  param("id")
    .notEmpty().withMessage("id không được để trống")
    .isString().withMessage("id phải là chuỗi"),
];
