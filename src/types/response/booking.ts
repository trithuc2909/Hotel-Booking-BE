import {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

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