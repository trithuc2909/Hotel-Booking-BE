import { BookingStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export interface BookingHistoryRoom {
  roomId: string;
  roomName: string;
  pricePerNight: number;
  nights: number;
  thumbnailUrl: string | null;
}

export interface BookingHistoryService {
  serviceName: string;
  quantity: number;
  unit: string;
  totalPrice: number;
}

export interface BookingHistoryPayment {
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paidAt: Date | null;
  amount: number;
}

export interface BookingHistoryStatus {
  code: string;
  displayAs: string;
}

export interface BookingHistoryResponse {
  id: string;
  bookingCode: string;

  status: BookingHistoryStatus;

  checkInDate: Date;
  checkOutDate: Date;

  totalNights: number;
  totalAmount: number;

  createdOn: Date | null;

  rooms: BookingHistoryRoom[];

  services: BookingHistoryService[];

  latestPayment: BookingHistoryPayment | null;
}

export type AdminBookingsFilter = {
  pageNum?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  status?: string;
  search?: string;
  checkInDate?: string;
  checkOutDate?: string;
};

export interface AdminBookingResponse {
  id: string;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkInDate: Date;
  checkOutDate: Date;
  totalAmount: number;
  status: string;
  displayAs: string | null;
  createdOn: Date | null;

  rooms: { roomName: string }[];
  services: { serviceName: string; quantity: number }[];
}

export interface FindAdminBookingsResponse {
  data: AdminBookingResponse[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export interface BookingActivityResponse {
  id: string;
  bookingCode: string;
  customerName: string;
  status: string;
  displayAs: string | null;
  modifiedOn: Date | null;
}

export interface BookingAllocationResponse {
  status: string;
  displayAs: string | null;
  count: number;
}

export interface BookingAnalyticsResponse {
  recentActivities: BookingActivityResponse[];
  allocation: BookingAllocationResponse[];
}
