import { createTransport } from "nodemailer";

import { mailFrom, mailSender, smtp } from "@/config";

export interface OutgoingMail {
  to: string[];
  replyTo?: string;
  subject: string;
  text: string;
}

export class MailNotConfiguredError extends Error {}

const transport = smtp.host
  ? createTransport({
      host: smtp.host,
      port: smtp.port,
      auth: smtp.username
        ? { user: smtp.username, pass: smtp.password }
        : undefined,
    })
  : null;

export async function sendMail(mail: OutgoingMail): Promise<void> {
  if (!transport) {
    if (process.env.NODE_ENV === "production")
      throw new MailNotConfiguredError("SMTP_HOSTNAME is not set");
    console.log("Would send mail were SMTP_HOSTNAME set:", mail);
    return;
  }
  await transport.sendMail({ sender: mailSender, from: mailFrom, ...mail });
}
