import dotenv from "dotenv";
import { SignOptions } from "jsonwebtoken";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";

const config = {
  env: NODE_ENV,

  app: {
    port: Number(process.env.PORT || 3001),
    name: "Hotel Booking API",
  },

  database: {
    url: process.env.DATABASE_URL as string,
  },

  jwt: {
    accessTokenSecretKey: process.env.ACCESS_TOKEN_SECRET!,
    refreshTokenSecretKey: process.env.REFRESH_TOKEN_SECRET!,
    accessTokenExpiresIn: (process.env.ACCESS_TOKEN_EXPIRE ||
      "1h") as SignOptions["expiresIn"],
    refreshTokenExpiresIn: (process.env.REFRESH_TOKEN_EXPIRE ||
      "7d") as SignOptions["expiresIn"],
  },

  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
      : ["http://localhost:3000"],
  },

  logging: {
    level: process.env.LOG_LEVEL || "debug",
  },

  security: {
    rateLimit: {
      enabled: process.env.RATE_LIMIT_ENABLE === "true",
      max: Number(process.env.RATE_LIMIT_MAX || 100),
    },
  },

  isDevelopment: NODE_ENV === "development",
  isProduction: NODE_ENV === "production",

  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      supportEmail:
        process.env.SMTP_SUPPORT_EMAIL || "support@bullmanhotel.com",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    },
    from: {
      name: process.env.SMTP_FROM_NAME || "Hotel Booking",
      email: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
    },
  },

  frontend: {
    url: process.env.FRONTEND_URL || "http://localhost:3000",
  },

  otp: {
    expiresMinutes: 5, // OTP expires in 5 minutes
    length: 6,
  },

  reset_password: {
    expiresMinutes: 15, // Reset password link expires in 15 minutes
  },

  minio: {
    endPoint: process.env.MINIO_ENDPOINT || "localhost",
    port: parseInt(process.env.MINIO_PORT || "9000"),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || "trithuc290904",
    publicUrl: process.env.MINIO_PUBLIC_URL || "http://localhost:9000",
  },

  defaults: {
    logoUrl: `${process.env.MINIO_PUBLIC_URL || "http://localhost:9000"}/images/defaults/logo-default.png`
  },

  momo: {
    partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
    accessKey: process.env.MOMO_ACCESS_KEY || "",
    secretKey: process.env.MOMO_SECRET_KEY || "",
    endpoint: process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create",
    redirectUrl: process.env.MOMO_REDIRECT_URL || "http://localhost:3000/payment/result",
    ipnUrl: process.env.MOMO_IPN_URL || ""
  }
};

if (!config.database.url) {
  throw new Error("DATABASE_URL is required");
}

if (config.isProduction) {
  if (!config.jwt.accessTokenSecretKey || !config.jwt.refreshTokenSecretKey) {
    throw new Error("JWT secrets must be set in production");
  }
}

export default config;
