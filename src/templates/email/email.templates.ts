import fs from "fs";
import path from "path";
import { EmailType, RenderTemplateResponse } from "./email.types";
import AppError from "../../utils/appError";

const templateMap: Record<EmailType, { subject: string; file: string }> = {
  [EmailType.REGISTRATION_OTP]: {
    subject: "Verify your email",
    file: "registration-otp.html",
  },
};

function compileTemplate(
  template: string,
  data: Record<string, string>,
): string {
  let html = template;

  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    html = html.replace(regex, value);
  }
  return html;
}

export function renderEmailTemplate(
  type: EmailType,
  data: Record<string, string>,
): RenderTemplateResponse {
  const config = templateMap[type];

  if (!config) {
    throw AppError.notFound(
      `Không tìm thấy email với type = ${type}`,
      "EMAIL_TYPE_NOT_FOUND",
    );
  }

  const templatePath = path.join(__dirname, config.file);

  const rawTemplate = fs.readFileSync(templatePath, "utf-8");
  const html = compileTemplate(rawTemplate, data);

  return {
    subject: config.subject,
    html,
  };
}
