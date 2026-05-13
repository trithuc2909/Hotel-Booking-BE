import crypto from "crypto";
import config from "../config";
import {
  VNPayPaymentRequest,
  VNPayWebhookRequest,
} from "../types/request/vnpay";
import { formatDate } from "../utils/common";

const Encode = (str: string): string => {
  return encodeURIComponent(str).replace(/%20/g, "+");
};

const createSignature = (data: string): string => {
  return crypto
    .createHmac("sha512", config.vnpay.hashSecret)
    .update(data)
    .digest("hex");
};

export const createVNPayUrl = (request: VNPayPaymentRequest): string => {
  const createDate = formatDate(new Date());

  const expireDate = formatDate(new Date(Date.now() + 15 * 60 * 1000));

  const params: Record<string, string> = {
    vnp_Version: config.vnpay.version,
    vnp_Command: config.vnpay.command,
    vnp_TmnCode: config.vnpay.tmnCode,
    vnp_Amount: String(request.amount * 100),
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
    vnp_CurrCode: config.vnpay.currCode,
    vnp_IpAddr: request.ipAddr,
    vnp_Locale: request.locale || config.vnpay.locale,
    vnp_OrderInfo: request.orderInfo,
    vnp_OrderType: "other",
    vnp_ReturnUrl: request.returnUrl,
    vnp_TxnRef: request.orderId,
  };

  const sortedKeys = Object.keys(params).sort();

  const signData = sortedKeys.map((k) => `${k}=${Encode(params[k])}`).join("&");

  const signature = createSignature(signData);

  const urlQuery = sortedKeys
    .map((k) => `${k}=${Encode(params[k])}`)
    .join("&");

  return `${config.vnpay.url}?${urlQuery}&vnp_SecureHash=${signature}`;
};

export const verifyVNPaySignature = (query: VNPayWebhookRequest): boolean => {
  const receiveHash = query.vnp_SecureHash;

  const params: Record<string, string> = {};

  for (const key in query) {
    if (
      key !== "vnp_SecureHash" &&
      key !== "vnp_SecureHashType" &&
      key.startsWith("vnp_") &&
      query[key]
    ) {
      params[key] = query[key] as string;
    }
  }

  const sortedKeys = Object.keys(params).sort();

  const signData = sortedKeys.map((k) => `${k}=${Encode(params[k])}`).join("&");

  const expectedSignature = createSignature(signData);

  return receiveHash === expectedSignature;
};
