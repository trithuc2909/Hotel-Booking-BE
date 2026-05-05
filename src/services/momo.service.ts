import crypto from "crypto";
import axios from "axios";
import config from "../config";
import { MomoPaymentRequest, MomoWebHookRequest } from "../types/request/momo";
import { MomoPaymentResponse } from "../types/response/momo";

// Create signature
const createSignature = (rawData: string): string => {
  return crypto
    .createHmac("sha256", config.momo.secretKey)
    .update(rawData)
    .digest("hex");
};

// Verify signature from momo webhook
export const verifySignature = (request: MomoWebHookRequest): boolean => {
  const rawData =
    `accessKey=${config.momo.accessKey}` +
    `&amount=${request.amount}` +
    `&extraData=${request.extraData}` +
    `&message=${request.message}` +
    `&orderId=${request.orderId}` +
    `&orderInfo=${request.orderInfo}` +
    `&orderType=${request.orderType}` +
    `&partnerCode=${request.partnerCode}` +
    `&payType=${request.payType}` +
    `&requestId=${request.requestId}` +
    `&responseTime=${request.responseTime}` +
    `&resultCode=${request.resultCode}` +
    `&transId=${request.transId}`;

  const expectedSignature = createSignature(rawData);
  return request.signature === expectedSignature;
};

// call Momo API create payment
export const createMomoPayment = async (
  request: MomoPaymentRequest,
): Promise<MomoPaymentResponse> => {
  const requestId = `${request.orderId}-${Date.now()}`;
  const extraData = "";

  const rawData =
    `accessKey=${config.momo.accessKey}` +
    `&amount=${request.amount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${config.momo.ipnUrl}` +
    `&orderId=${request.orderId}` +
    `&orderInfo=${request.orderInfo}` +
    `&partnerCode=${config.momo.partnerCode}` +
    `&redirectUrl=${request.redirectUrl ?? config.momo.redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=payWithMethod`;

  const signature = createSignature(rawData);

  const body = {
    partnerCode: config.momo.partnerCode,
    accessKey: config.momo.accessKey,
    requestId,
    amount: request.amount,
    orderId: request.orderId,
    orderInfo: request.orderInfo,
    redirectUrl: request.redirectUrl ?? config.momo.redirectUrl,
    ipnUrl: config.momo.ipnUrl,
    requestType: "payWithMethod",
    extraData,
    lang: "vi",
    signature,
  };

  console.log("MoMo config:", {
    partnerCode: config.momo.partnerCode,
    accessKey: config.momo.accessKey,
    endpoint: config.momo.endpoint,
    amount: request.amount,
    orderId: request.orderId,
  });

  try {
    const response = await axios.post(config.momo.endpoint, body);
    return response.data;
  } catch (error: any) {
    console.error("MoMo raw body:", JSON.stringify(body, null, 2));
    console.error("MoMo error response:", error.response?.data);
    throw error;
  }
};
