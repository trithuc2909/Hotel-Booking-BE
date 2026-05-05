import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ResponseHelper } from "../../utils/response";

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors
    const formattedErrors = errors.array().reduce((acc: any, error) => {
      const field = error.type === "field" ? error.path : "unknown";
      if (!acc[field]) {
        acc[field] = [];
      }
      acc[field].push(error.msg);
      return acc;
    }, {});

    return res
      .status(400)
      .json(
        ResponseHelper.error(
          "Dữ liệu không hợp lệ",
          "VALIDATION_ERROR",
          formattedErrors,
        ),
      );
  }

  next();
};

export * from "./auth.validation";
export * from "./room.validation";
export * from "./common.validation";
export * from "./booking.validation";
