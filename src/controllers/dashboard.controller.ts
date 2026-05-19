import { Request, Response } from "express";
import { ResponseHelper } from "../utils/response";
import * as dashboardService from "../services/dashboard.service";
import { catchAsyncErrorWithCode } from "../utils/catchAsyncError";
import { matchedData } from "express-validator";
import { DashboardStatsPeriod } from "../types/request/dashboard";

export const getDashboardStats = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const { period, month } = matchedData(req);
    const stats = await dashboardService.getDashboardStats(
      period as DashboardStatsPeriod,
      month as string | undefined,
    );
    res.json(
      ResponseHelper.success(stats, "Lấy thống kê tổng quan thành công"),
    );
  },
  "GET_DASHBOARD_STATS_ERROR",
);

export const getDailyRevenue = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const { period, month } = matchedData(req);
    const revenue = await dashboardService.getDailyRevenue(
      period as DashboardStatsPeriod,
      month as string | undefined,
    );
    res.json(
      ResponseHelper.success(revenue, "Lấy biểu đồ doanh thu thành công"),
    );
  },
  "GET_DAILY_REVENUE_ERROR",
);

export const getRoomTimeline = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const { from, to } = matchedData(req);
    const timeline = await dashboardService.getRoomTimeline(
      from as string,
      to as string,
    );
    res.json(
      ResponseHelper.success(timeline, "Lấy timeline phòng thành công"),
    );
  },
  "GET_ROOM_TIMELINE_ERROR",
);
