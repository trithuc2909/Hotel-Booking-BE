import * as dashboardDb from "../db/dashboard.db";
import {
  DASHBOARD_STATS_PERIOD,
  DashboardStatsPeriod,
} from "../types/request/dashboard";
import {
  DailyRevenueResponse,
  DashboardStatsResponse,
  RoomTimelineResponse,
} from "../types/response/dashboard";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfDay,
  endOfDay,
} from "date-fns";

const calculatePercentageChange = (
  current: number,
  previous: number,
): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
};

export const getDashboardStats = async (
  period: DashboardStatsPeriod = DASHBOARD_STATS_PERIOD.CURRENT,
  month?: string,
): Promise<DashboardStatsResponse> => {
  const now = new Date();

  let targetDate =
    period === DASHBOARD_STATS_PERIOD.CURRENT ? now : subMonths(now, 1);

  if (month) {
    const [year, m] = month.split("-").map(Number);
    targetDate = new Date(year, m - 1, 1);
  }

  const targetStart = startOfMonth(targetDate);
  const targetEnd = endOfMonth(targetDate);

  const previousDate = subMonths(targetDate, 1);

  const previousStart = startOfMonth(previousDate);

  const previousEnd = endOfMonth(previousDate);

  const [targetStats, previousStats] = await Promise.all([
    dashboardDb.getDashboardStats(targetStart, targetEnd),

    dashboardDb.getDashboardStats(previousStart, previousEnd),
  ]);

  return {
    totalRevenue: {
      value: targetStats.totalRevenue,

      change: calculatePercentageChange(
        targetStats.totalRevenue,
        previousStats.totalRevenue,
      ),
    },

    totalBookings: {
      value: targetStats.totalBookings,

      change: calculatePercentageChange(
        targetStats.totalBookings,
        previousStats.totalBookings,
      ),
    },

    avgRoomRate: {
      value: targetStats.avgRoomRate,

      change: calculatePercentageChange(
        targetStats.avgRoomRate,
        previousStats.avgRoomRate,
      ),
    },
  };
};

export const getDailyRevenue = async (
  period: DashboardStatsPeriod = DASHBOARD_STATS_PERIOD.CURRENT,
  month?: string,
): Promise<DailyRevenueResponse[]> => {
  const now = new Date();

  let targetDate =
    period === DASHBOARD_STATS_PERIOD.CURRENT ? now : subMonths(now, 1);

  if (month) {
    const [year, m] = month.split("-").map(Number);
    targetDate = new Date(year, m - 1, 1);
  }

  const targetStart = startOfMonth(targetDate);

  const targetEnd = endOfMonth(targetDate);

  return dashboardDb.getDailyRevenue(targetStart, targetEnd);
};

export const getRoomTimeline = async (
  from: string,
  to: string,
): Promise<RoomTimelineResponse[]> => {
  const fromDate = startOfDay(new Date(from));
  const toDate = endOfDay(new Date(to));
  return dashboardDb.getRoomTimeline(fromDate, toDate);
};
