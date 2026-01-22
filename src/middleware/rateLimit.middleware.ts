import { Request, Response, NextFunction } from "express";

// In-memory storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

export const createRateLimiter = (config: RateLimitConfig) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `rate_limit: ${req.ip || "unknown"}`;

    const now = Date.now();
    const currentData = rateLimitStore.get(key);

    if (!currentData || now > currentData.resetTime) {
      // New window
      rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    } else {
      // Increment count
      currentData.count++;
      rateLimitStore.set(key, currentData);
    }

    const currentCount = rateLimitStore.get(key)?.count || 0;

    if (currentCount > config.maxRequests) {
      const retryAfter = Math.ceil(config.windowMs / 1000);
      res.set("Retry-After", retryAfter.toString());
      res.status(429).json({
        succeeded: false,
        message:
          config.message ||
          `Too many request. Try again after ${retryAfter} seconds.`,
        code: "RATE_LIMIT_EXCEEDED",
      });
      return;
    }

    // Set rate limit headers
    res.set("X-RateLimit-Limit", config.maxRequests.toString());

    res.set(
      "X-RateLimit-Remaining",
      (config.maxRequests - currentCount).toString(),
    );
    next();
  };
};

// Predefined rate limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15p
  maxRequests: 5, // 5 login attempts
  message: "Too many login attempts. Please try again later.",
});

export const generalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1p
  maxRequests: 100, // 100 request / 1p
});
