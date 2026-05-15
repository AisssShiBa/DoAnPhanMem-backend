import nodemailer from "nodemailer";
import dns from "dns";
import SMTPTransport from "nodemailer/lib/smtp-transport";

dns.setDefaultResultOrder("ipv4first");

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
