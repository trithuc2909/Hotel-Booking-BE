import { Prisma } from "@prisma/client";

export type StatItem = {
  value: number;
  change: number;
};

export type DashboardStatsResponse = {
  totalRevenue: StatItem;
  totalBookings: StatItem;
  avgRoomRate: StatItem;
};

export type TimelineBooking = {
  guestName: string;
  bookingCode: string;
  checkInDate: Date;
  checkOutDate: Date;
  status: string;
};

export type RoomTimelineResponse = {
  roomCode: string;
  roomType: string;
  bookings: TimelineBooking[];
};

export type DailyRevenueResponse = {
  day: string;
  revenue: number;
};
