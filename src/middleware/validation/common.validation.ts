import { param, ValidationChain } from "express-validator";

export const validateId: ValidationChain[] = [
  param("id")
    .notEmpty()
    .withMessage("Id không được để trống")
    .isString()
    .withMessage("Id phải là chuỗi")
    .trim(),
];
