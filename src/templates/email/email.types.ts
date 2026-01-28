export enum EmailType {
  REGISTRATION_OTP = "REGISTRATION_OTP",
}

export interface SendEmailProps {
  to: string;
  subject?: string;
  data: Record<string, string>;
}

export interface RenderTemplateResponse {
  subject?: string;
  html: string;
}
