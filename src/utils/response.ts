export class ResponseHelper {
  // Success Response
  static success<T>(data: T, message: string = "Success", meta?: any) {
    return {
      succeeded: true,
      message,
      data,
      meta: meta || null,
      errors: null,
    };
  }

  // Error response
  static error(message: string, code?: string, errors?: any) {
    return {
      succeeded: false,
      message,
      code: code || "ERROR",
      data: null,
      errors: errors || null,
    };
  }

  // Paginated response
  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = "Success",
  ) {
    return {
      succeeded: true,
      message,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      errors: null,
    };
  }
}
