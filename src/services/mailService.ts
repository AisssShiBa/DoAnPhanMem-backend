import nodemailer from "nodemailer";
import dns from "dns";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { Resend } from "resend";

dns.setDefaultResultOrder("ipv4first");

// ─── Types ───────────────────────────────────────────────────────────────────

interface MailProvider {
  verifyMailConnection: () => void;
  sendVerifyEmail: (
    email: string,
    name: string,
    token: string,
  ) => Promise<unknown>;
  sendResetPasswordEmail: (
    email: string,
    name: string,
    token: string,
  ) => Promise<unknown>;
  sendReminderEmail: (
    email: string,
    name: string,
    taskTitle: string,
    dueDate: Date | null,
  ) => Promise<unknown>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDueDate = (dueDate: Date | null) =>
  dueDate
    ? dueDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Chưa đặt deadline";

// ─── HTML Templates ──────────────────────────────────────────────────────────

const verifyEmailHtml = (name: string, verifyLink: string) => `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
    <h2 style="color:#6366f1">Chào ${name}!</h2>
    <p>Cảm ơn bạn đã đăng ký.</p>
    <a href="${verifyLink}"
       style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;
              border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
      Xác minh Email
    </a>
    <p style="color:#888;font-size:13px">Link hết hạn sau 24 giờ.</p>
  </div>`;

const resetPasswordHtml = (name: string, resetLink: string) => `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
    <h2 style="color:#6366f1">Chào ${name}!</h2>
    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
    <a href="${resetLink}"
       style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;
              border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
      Đặt lại mật khẩu
    </a>
    <p style="color:#888;font-size:13px">Link hết hạn sau <strong>15 phút</strong>.</p>
    <p style="color:#bbb;font-size:12px">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
  </div>`;

const reminderEmailHtml = (
  name: string,
  taskTitle: string,
  formattedDate: string,
) => `
  <div style="font-family:sans-serif;max-width:480px;margin:auto;
              padding:24px;border-radius:12px;border:1px solid #e5e7eb;">
    <h2 style="color:#6366f1;margin-bottom:4px;">⏰ Nhắc nhở deadline</h2>
    <p style="color:#6b7280;font-size:14px;">SoftWhere — Quản lý công việc cá nhân</p>
    <hr style="border:none;border-top:1px solid #f3f4f6;margin:16px 0;" />
    <p style="font-size:15px;color:#111827;">
      Chào <strong>${name}</strong>, công việc
      <strong>"${taskTitle}"</strong> sắp đến hạn.
    </p>
    <div style="background:#fef2f2;border-radius:8px;padding:12px 16px;margin:16px 0;">
      <p style="margin:0;color:#b91c1c;font-size:14px;">
        📅 Deadline: <strong>${formattedDate}</strong>
      </p>
    </div>
    <p style="font-size:12px;color:#9ca3af;margin-top:20px;border-top:1px solid #f3f4f6;padding-top:12px;">
      Bạn nhận email này vì đã bật nhắc nhở trên SoftWhere.
      Tắt trong <strong>Cài đặt → Hồ sơ</strong> nếu không muốn nhận.
    </p>
  </div>`;

// ─── Nodemailer Provider ──────────────────────────────────────────────────────

const createNodemailerProvider = (): MailProvider => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  } as SMTPTransport.Options);

  const FROM = process.env.MAIL_FROM || process.env.MAIL_USER;

  return {
    verifyMailConnection: () => {
      transporter.verify((err) => {
        if (err) console.warn("⚠️ Mail chưa cấu hình đúng:", err.message);
        else console.log("✅ Mail transporter sẵn sàng (Nodemailer)");
      });
    },

    sendVerifyEmail: (email, name, token) => {
      const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      return transporter.sendMail({
        from: FROM,
        to: email,
        subject: "Xác minh tài khoản SoftWhere của bạn",
        html: verifyEmailHtml(name, verifyLink),
      });
    },

    sendResetPasswordEmail: (email, name, token) => {
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      return transporter.sendMail({
        from: FROM,
        to: email,
        subject: "Đặt lại mật khẩu SoftWhere của bạn",
        html: resetPasswordHtml(name, resetLink),
      });
    },

    sendReminderEmail: (email, name, taskTitle, dueDate) =>
      transporter.sendMail({
        from: FROM,
        to: email,
        subject: `⏰ Nhắc nhở: "${taskTitle}" sắp đến hạn!`,
        html: reminderEmailHtml(name, taskTitle, formatDueDate(dueDate)),
      }),
  };
};

// ─── Resend Provider ──────────────────────────────────────────────────────────

const createResendProvider = (): MailProvider => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = process.env.MAIL_FROM || "onboarding@resend.dev";

  return {
    verifyMailConnection: () => console.log("✅ Resend sẵn sàng"),

    sendVerifyEmail: (email, name, token) => {
      const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      return resend.emails.send({
        from: FROM,
        to: email,
        subject: "Xác minh tài khoản SoftWhere của bạn",
        html: verifyEmailHtml(name, verifyLink),
      });
    },

    sendResetPasswordEmail: (email, name, token) => {
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      return resend.emails.send({
        from: FROM,
        to: email,
        subject: "Đặt lại mật khẩu SoftWhere của bạn",
        html: resetPasswordHtml(name, resetLink),
      });
    },

    sendReminderEmail: (email, name, taskTitle, dueDate) =>
      resend.emails.send({
        from: FROM,
        to: email,
        subject: `⏰ Nhắc nhở: "${taskTitle}" sắp đến hạn!`,
        html: reminderEmailHtml(name, taskTitle, formatDueDate(dueDate)),
      }),
  };
};
import * as SibApiV3Sdk from "@getbrevo/brevo";

const createBrevoApiProvider = (): MailProvider => {
  const sendEmail = async (to: string, subject: string, html: string) => {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY || "",
      },
      body: JSON.stringify({
        sender: { name: "SoftWhere", email: "dattran22062005@gmail.com" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Brevo API error: ${err}`);
    }
    return res.json();
  };

  return {
    verifyMailConnection: () => console.log("✅ Brevo API sẵn sàng"),
    sendVerifyEmail: (email, name, token) => {
      const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      return sendEmail(
        email,
        "Xác minh tài khoản SoftWhere",
        verifyEmailHtml(name, link),
      );
    },
    sendResetPasswordEmail: (email, name, token) => {
      const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      return sendEmail(
        email,
        "Đặt lại mật khẩu SoftWhere",
        resetPasswordHtml(name, link),
      );
    },
    sendReminderEmail: (email, name, taskTitle, dueDate) =>
      sendEmail(
        email,
        `⏰ Nhắc nhở: "${taskTitle}" sắp đến hạn!`,
        reminderEmailHtml(name, taskTitle, formatDueDate(dueDate)),
      ),
  };
};
// ─── Active Provider ──────────────────────────────────────────────────────────

const provider: MailProvider =
  process.env.MAIL_PROVIDER === "brevo"
    ? createBrevoApiProvider()
    : process.env.MAIL_PROVIDER === "resend"
      ? createResendProvider()
      : createNodemailerProvider();
export const {
  verifyMailConnection,
  sendVerifyEmail,
  sendResetPasswordEmail,
  sendReminderEmail,
} = provider;
