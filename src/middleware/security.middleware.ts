import { Request, Response, NextFunction } from "express";

// Security headers middleware
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.setHeader("X-Frame-Options", "DENY");

  res.setHeader("X-Content-Type-Options", "nosniff");

  res.setHeader("X-XSS-Protection", "1; mode=block");

  // HTTPS only (production)
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline';",
    );
    next();
  }
};

// Prevent parameter pollution middleware
export const preventParameterPollution = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Ensure query parameters are strings, not arrays
  for (const key in req.query) {
    if (Array.isArray(req.query[key])) {
      req.query[key] = (req.query[key] as string[])[0];
    }
  }
  next();
};

// Request size limit
export const requestSizeLimit = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const contentLength = parseInt(req.headers["content-length"] || "0");
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    res.status(413).json({
      succeeded: false,
      message: "Request entity too large",
      code: "PAYLOAD_TOO_LARGE",
    });
    return;
  }
  next();
};
