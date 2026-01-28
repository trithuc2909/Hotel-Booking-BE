export interface UserResponse {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  createdOn: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// Refresh token response
export interface RefreshTokenResponse {
  accessToken: string;
}

// OTP response
export interface OTPResponse {
  message: string;
  email: string;
  otp: string; // seconds
}
