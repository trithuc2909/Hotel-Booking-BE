export interface VNPayPaymentRequest {
  orderId: string;
  amount: number;
  orderInfo: string;
  ipAddr: string;
  returnUrl: string;
  locale?: string;
}

export interface VNPayWebhookRequest {
  vnp_TmnCode: string;
  vnp_Command: string;

  vnp_Amount: string;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;

  vnp_PayDate: string;
  vnp_OrderInfo: string;
  vnp_OrderType: string;
  vnp_TransactionNo: string;
  vnp_ResponseCode: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
  vnp_SecureHashType?: string;
  [key: string]: string | undefined;
}