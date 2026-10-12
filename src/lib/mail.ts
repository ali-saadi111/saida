import "server-only";
import { promises as fs } from "fs";
import path from "path";
import nodemailer from "nodemailer";

interface Mail {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

/**
 * Sends through SMTP_URL when configured (e.g. smtps://user:pass@smtp.example.org).
 * Without it, mail is appended to data/outbox.log so the flow can be tested locally.
 */
export async function sendMail(mail: Mail) {
  const from = process.env.MAIL_FROM || "MCCD Saida 2027 <no-reply@localhost>";
  if (process.env.SMTP_URL) {
    try {
      await nodemailer.createTransport(process.env.SMTP_URL).sendMail({ from, ...mail });
      return true;
    } catch (err) {
      console.error("[mail] send failed", err);
      return false;
    }
  }
  const dir = process.env.DATA_DIR || path.join(process.cwd(), "data");
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(
    path.join(dir, "outbox.log"),
    `--- ${new Date().toISOString()}\nFrom: ${from}\nTo: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text}\n\n`,
  );
  return true;
}

export function teamInbox() {
  return process.env.TEAM_EMAIL || process.env.CONTACT_EMAIL;
}
