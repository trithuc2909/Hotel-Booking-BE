import nodemailer from "nodemailer";
import config from "../config";
import logger from "../config/logger.config";
import { renderEmailTemplate } from "../templates/email/email.templates";
import { EmailType } from "../templates/email/email.types";

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(config.email.smtp);
  }

  // Send email (private method)
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: `"${config.email.from.name}" <${config.email.from.email}>`,
        to,
        subject,
        html,
      });

      logger.info(
        `Email sent successfully to ${to} | MessageID: ${info.messageId}`,
      );
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
      logoUrl:
        process.env.DEFAULT_LOGO_BULLMANHOTEL ||
        `${config.frontend.url}/images/logo-default.jpg`,
      supportEmail:
        config.email.smtp.supportEmail || "support@bullmanhotel.com",
    });
    // Send email
    await this.sendEmail(email, subject || "Xác thực email của bạn", html);
  }

  // Verify SMTP connection
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info("SMTP connection verified successfully");
      return true;
    } catch (error) {
      logger.error("SMTP connection failed:", error);
      return false;
    }
  }
}

export default new EmailService();
