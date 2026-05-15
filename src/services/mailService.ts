import nodemailer from "nodemailer";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

import SMTPTransport from "nodemailer/lib/smtp-transport";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
} as SMTPTransport.Options);

// ✅ Verify mail connection
export const verifyMailConnection = () => {
  transporter.verify((err) => {
    if (err) {
      console.warn("⚠️ Mail chưa cấu hình đúng:", err.message);
    } else {
      console.log("✅ Mail transporter sẵn sàng");
    }
  });
};

const FROM = process.env.MAIL_FROM || process.env.MAIL_USER;

export const sendVerifyEmail = async (
  email: string,
  name: string,
  token: string,
) => {
  const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  return transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Xác minh tài khoản SoftWhere của bạn",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#6366f1">Chào ${name}!</h2>

        <p>Cảm ơn bạn đã đăng ký.</p>

        <a href="${verifyLink}"
          style="display:inline-block;
                 background:#6366f1;
                 color:#fff;
                 padding:12px 24px;
                 border-radius:8px;
                 text-decoration:none;
                 font-weight:600;
                 margin:16px 0">
          Xác minh Email
        </a>

        <p>Link hết hạn sau 24 giờ.</p>
      </div>
    `,
  });
};

export const sendResetPasswordEmail = async (
  email: string,
  name: string,
  token: string,
) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  return transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Đặt lại mật khẩu SoftWhere của bạn",
    html: `
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
      </div>`,
  });
};
