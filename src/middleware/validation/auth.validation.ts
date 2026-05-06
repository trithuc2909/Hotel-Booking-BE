import { body, ValidationChain } from "express-validator";

export const signUpValidation: ValidationChain[] = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email không được để trống")
    .isEmail()
    .withMessage("Email không đúng định dạng")
    .isLength({ min: 6 })
    .withMessage("Email phải có từ 6 ký tự trở lên")
    .isLength({ max: 255 })
    .withMessage("Email không được vượt quá 255 ký tự")
    .normalizeEmail(),

  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username không được để trống")
    .isLength({ min: 3 })
    .withMessage("Username phải có từ 3 ký tự trở lên")
    .isLength({ max: 50 })
    .withMessage("Username không được vượt quá 50 ký tự")
    .matches(/^[\p{L}\p{N}\s_]+$/u)
    .withMessage("Username chỉ được chứa ký tự chữ, số và dấu gạch dưới"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Mật khẩu không được để trống")
    .isLength({ min: 8 })
    .withMessage("Mật khẩu phải có ít nhất 8 ký tự")
    .matches(/[A-Z]/)
    .withMessage("Mật khẩu phải chứa ít nhất một chữ cái in hoa")
    .matches(/[a-z]/)
    .withMessage("Mật khẩu phải chứa ít nhất một chữ cái in thường")
    .matches(/[0-9]/)
    .withMessage("Mật khẩu phải chứa ít nhất một chữ số")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Mật khẩu phải chứa ít nhất một ký tự đặc biệt")
    .custom((value, { req }) => {
      if (value.toLowerCase() === req.body.email?.toLowerCase()) {
        throw new Error("Mật khẩu không được trùng với email");
      }
      if (value.toLowerCase() === req.body.username?.toLowerCase()) {
        throw new Error("Mật khẩu không được trùng với tên đăng nhập");
      }
      return true;
    }),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Xác nhận mật khẩu không được để trống")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Xác nhận mật khẩu không khớp");
      }
      return true;
    }),
];

export const loginValidation: ValidationChain[] = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email không được để trống")
    .isEmail()
    .withMessage("Email không đúng định dạng")
    .isLength({ min: 6 })
    .withMessage("Email phải có từ 6 ký tự trở lên")
    .isLength({ max: 255 })
    .withMessage("Email không được vượt quá 255 ký tự")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Mật khẩu không được để trống")
    .isLength({ min: 8 })
    .withMessage("Mật khẩu phải có ít nhất 8 ký tự")
    .matches(/[A-Z]/)
    .withMessage("Mật khẩu phải chứa ít nhất một chữ cái in hoa")
    .matches(/[a-z]/)
    .withMessage("Mật khẩu phải chứa ít nhất một chữ cái in thường")
    .matches(/[0-9]/)
    .withMessage("Mật khẩu phải chứa ít nhất một chữ số")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Mật khẩu phải chứa ít nhất một ký tự đặc biệt"),
];

export const verifyOTPValidation: ValidationChain[] = [
  body("userId")
    .trim()
    .notEmpty()
    .withMessage("User Id không được để trống")
    .isString()
    .withMessage("User Id phải là một chuỗi"),

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("Mã OTP không được để trống")
    .isLength({ min: 6, max: 6 })
    .withMessage("Mã OTP phải có 6 ký tự")
    .isNumeric()
    .withMessage("Mã OTP chỉ chứa số"),
];

export const resendOTPValidation: ValidationChain[] = [
  body("userId")
    .trim()
    .notEmpty()
    .withMessage("User ID không được để trống")
    .isString()
    .withMessage("User ID phải là chuỗi"),
];

export const forgotPasswordValidation: ValidationChain[] = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email không được để trống")
    .bail()
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail(),
];

export const resetPasswordValidation: ValidationChain[] = [
  body("token").trim().notEmpty().withMessage("Token không được để trống"),

  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("Mật khẩu mới không được để trống")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Mật khẩu phải có ít nhất 8 ký tự")
    .matches(/[A-Z]/)
    .withMessage("Mật khẩu phải chứa ít nhất một chữ cái in hoa")
    .matches(/[a-z]/)
    .withMessage("Mật khẩu phải chứa ít nhất một chữ cái in thường")
    .matches(/[0-9]/)
    .withMessage("Mật khẩu phải chứa ít nhất một chữ số")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Mật khẩu phải chứa ít nhất một ký tự đặc biệt"),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Xác nhận mật khẩu không được để trống")
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Mật khẩu xác nhận không khớp");
      }
      return true;
    }),
];
export const changePasswordValidation: ValidationChain[] = [
  body("oldPassword")
    .trim()
    .notEmpty()
    .withMessage("Mật khẩu cũ không được để trống"),
  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("Mật khẩu mới không được để trống")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Mật khẩu phải có ít nhất 8 ký tự")
    .matches(/[A-Z]/)
    .withMessage("Mật khẩu phải chứa ít nhất một chữ cái in hoa")
    .matches(/[a-z]/)
    .withMessage("Mật khẩu phải chứa ít nhất một chữ cái in thường")
    .matches(/[0-9]/)
    .withMessage("Mật khẩu phải chứa ít nhất một chữ số")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Mật khẩu phải chứa ít nhất một ký tự đặc biệt"),
  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Xác nhận mật khẩu không được để trống")
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Mật khẩu xác nhận không khớp");
      }
      return true;
    }),
];
