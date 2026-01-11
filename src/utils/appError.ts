// Kế thừa từ Error của JavaScript
class AppError extends Error {
  public statusCode: number; // HTTP status code
  public isOperational: boolean; // Lỗi có thể dự đoán được hay không
  public code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message) // Gọi constructor của Error
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Stack trace để debug
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
