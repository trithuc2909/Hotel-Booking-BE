import { PaymentMethod } from "@prisma/client";

export interface CreatePaymentRequest {
  bookingId: string;
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  payUrl?: string;
}
