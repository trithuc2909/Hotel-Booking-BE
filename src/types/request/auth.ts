export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Refresh token request
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Verify OTP request
export interface VerifyOTPRequest {
  userId: string;
  otp: string;
}

export interface ResendOTPRequest {
  userId: string;
}
