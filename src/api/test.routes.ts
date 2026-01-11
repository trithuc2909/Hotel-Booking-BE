import { Router, Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

// Test 1: Lỗi 404
router.get('/error/404', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError('This resource does not exist', 404, true, 'NOT_FOUND'));
});

// Test 2: Lỗi 500
router.get('/error/500', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError('Internal server error', 500));
});

// Test 3: Async error (database error simulation)
router.get('/error/async', asyncHandler(async (req: Request, res: Response) => {
  // Simulate async operation that throws error
  throw new AppError('Async operation failed', 400, true, 'ASYNC_ERROR');
}));

// Test 4: Unhandled error (JavaScript error)
router.get('/error/unhandled', (req: Request, res: Response) => {
  // @ts-ignore - Cố tình tạo lỗi
  const result = undefined.someProperty;
  res.json({ result });
});

export default router;