export interface MomoPaymentResponse {
  payUrl: string;
  orderId: string;
  requestId: string;
  resultCode: number;
  message: string;
}
