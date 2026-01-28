import AppError from "./appError";

export class ResponseHelper {
  // Success Response
  static success<T>(
    data: T,
    message: string = "Success",
    code?: string,
    meta?: any,
  ) {
    return {
      succeeded: true,
      message,
      code: code || "SUCCESS",
      data,
      meta: meta || null,
      errors: null,
    };
  }

  // Error response
  static error(message: string, code: string = "ERROR", errors?: any) {
    return {
      succeeded: false,
      message,
      code,
      data: null,
      errors: errors || null,
    };
  }

  // Paginated response
  static paginated<T>(
    data: T[],
    total: number,
    pageNum: number,
    pageSize: number,
    message: string = "Success",
  ) {
    return {
      succeeded: true,
      message,
      code: "SUCCESS",
      data,
      meta: {
        total,
        pageNum,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      errors: null,
    };
  }

  // From AppError - Convert AppError thành response
  static fromAppError(error: AppError) {
    return {
      succeeded: false,
      message: error.message,
      code: error.code || "ERROR",
      data: null,
      errors: null,
    };
  }
}
