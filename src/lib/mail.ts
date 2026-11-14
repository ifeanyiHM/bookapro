import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransport(): Transporter | null {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

/** Never throws: a failed email must not fail a booking. Returns whether it was sent. */
export async function sendMail(mail: Mail): Promise<boolean> {
  if (!mail.to) return false;
  const t = getTransport();
  if (!t) {
    console.info(`[mail:not-sent, SMTP_HOST is blank] to=${mail.to} subject="${mail.subject}"\n${mail.text}\n`);
    return false;
  }
  try {
    await t.sendMail({
      from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      replyTo: mail.replyTo,
    });
    return true;
  } catch (err) {
    console.error("[mail] send failed", err);
    return false;
  }
}

export function teamAddress(): string {
  return process.env.MAIL_TEAM_TO ?? "";
}
