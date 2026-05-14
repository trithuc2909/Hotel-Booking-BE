import { Resend } from "resend";
import config from "../config";
import logger from "../config/logger.config";
import { renderEmailTemplate } from "../templates/email/email.templates";
import { EmailType } from "../templates/email/email.types";

// Resend client — dùng HTTP API (port 443), Railway không block
const resend = new Resend(process.env.SMTP_PASSWORD);

class EmailService {
  // Send email (private method)
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      const fromName = config.email.from.name || "Hotel Booking System";
      const fromEmail = config.email.from.email || "onboarding@resend.dev";

      const { data, error } = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: [to],
        subject,
        html,
      });

      if (error) {
        logger.error(`Resend API error sending to ${to}:`, error);
        throw new Error(error.message);
      }

      logger.info(`Email sent successfully to ${to} | MessageID: ${data?.id}`);
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  // Send registration OTP
  async sendRegistrationOTP(
    email: string,
    fullName: string,
    userId: string,
    otp: string,
  ): Promise<void> {
    // Create verify URL (frontend URL)
    const verifyUrl = `${config.frontend.url}/verify-otp?userId=${userId}`;

    // Compile template
    const { subject, html } = renderEmailTemplate(EmailType.REGISTRATION_OTP, {
      name: fullName,
      otp: otp,
      verifyUrl: verifyUrl,
      expiresIn: `${config.otp.expiresMinutes} phút`,
      logoUrl: config.defaults.logoUrl,
      supportEmail:
        config.email.smtp.supportEmail || "support@bullmanhotel.com",
    });
    // Send email
    await this.sendEmail(email, subject || "Xác thực email của bạn", html);
  }

  // Verify connection (no-op for Resend HTTP API)
  async verifyConnection(): Promise<boolean> {
    try {
      // Resend doesn't need SMTP handshake — HTTP API always ready
      logger.info("Resend HTTP API — no connection verification needed");
      return true;
    } catch (error) {
      logger.error("Resend connection check failed:", error);
      return false;
    }
  }

  // Send reset password
  async sendResetPasswordEmail(
    email: string,
    username: string,
    resetUrl: string,
  ): Promise<void> {
    if (!email) {
      throw new Error("Email is required");
    }

    const { subject, html } = renderEmailTemplate(EmailType.RESET_PASSWORD, {
      name: username,
      resetUrl: encodeURI(resetUrl),
      expiresIn: `${config.reset_password.expiresMinutes} phút`,
      logoUrl: config.defaults.logoUrl,
      supportEmail:
        config.email.smtp.supportEmail || "support@bullmanhotel.com",
    });

    await this.sendEmail(email, subject || "Đặt lại mật khẩu", html);
  }
}

export default new EmailService();
