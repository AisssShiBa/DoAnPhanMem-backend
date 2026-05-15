import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ✅ FIX: Verify kết nối mail khi khởi động — dễ debug khi deploy
export const verifyMailConnection = () => {
  transporter.verify((err) => {
    if (err) console.warn("⚠️  Mail chưa cấu hình đúng:", err.message);
    else console.log("✅ Mail transporter sẵn sàng");
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
        <p>Cảm ơn bạn đã đăng ký. Nhấn nút bên dưới để kích hoạt tài khoản:</p>
        <a href="${verifyLink}"
           style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;
                  border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Xác minh Email
        </a>
        <p style="color:#888;font-size:13px">Link hết hạn sau <strong>24 giờ</strong>.</p>
        <p style="color:#bbb;font-size:12px">Nếu bạn không đăng ký, hãy bỏ qua email này.</p>
      </div>`,
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
