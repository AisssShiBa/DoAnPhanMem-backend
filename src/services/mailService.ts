import { Resend } from "resend";

const FROM = process.env.MAIL_FROM || "noreply@softwhere.online";
type EmailPayload = Parameters<Resend["emails"]["send"]>[0];

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY chưa được cấu hình");
  }
  return new Resend(apiKey);
};

const sendEmail = async (payload: EmailPayload) => {
  const resend = getResendClient();
  const result = await resend.emails.send(payload);
  if (result.error) {
    throw result.error;
  }
  return result.data;
};

const formatDueDate = (dueDate: Date | null) =>
  dueDate
    ? dueDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
      })
    : "Chưa đặt deadline";

const verifyEmailHtml = (name: string, verifyLink: string) => `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
    <h2 style="color:#6366f1">Chào ${name}!</h2>
    <p>Cảm ơn bạn đã đăng ký tài khoản SoftWhere.</p>
    <a href="${verifyLink}"
       style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;
              border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
      Xác minh email
    </a>
    <p style="color:#888;font-size:13px">Link xác minh sẽ hết hạn sau 15 phút.</p>
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
    <p style="color:#888;font-size:13px">Link sẽ hết hạn sau <strong>15 phút</strong>.</p>
    <p style="color:#bbb;font-size:12px">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
  </div>`;

const reminderEmailHtml = (
  name: string,
  taskTitle: string,
  formattedDate: string,
) => `
  <div style="font-family:sans-serif;max-width:480px;margin:auto;
              padding:24px;border-radius:12px;border:1px solid #e5e7eb;">
    <h2 style="color:#6366f1;margin-bottom:4px;">Nhắc nhở deadline</h2>
    <p style="color:#6b7280;font-size:14px;">SoftWhere - Quản lý công việc cá nhân</p>
    <hr style="border:none;border-top:1px solid #f3f4f6;margin:16px 0;" />
    <p style="font-size:15px;color:#111827;">
      Chào <strong>${name}</strong>, công việc
      <strong>"${taskTitle}"</strong> sắp đến hạn.
    </p>
    <div style="background:#fef2f2;border-radius:8px;padding:12px 16px;margin:16px 0;">
      <p style="margin:0;color:#b91c1c;font-size:14px;">
        Deadline: <strong>${formattedDate}</strong>
      </p>
    </div>
    <p style="font-size:12px;color:#9ca3af;margin-top:20px;
              border-top:1px solid #f3f4f6;padding-top:12px;">
      Bạn nhận email này vì đã bật nhắc nhở deadline trong cài đặt SoftWhere.
    </p>
  </div>`;

export const verifyMailConnection = () => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Mail] RESEND_API_KEY chưa được cấu hình");
    return;
  }
  console.log("[Mail] Resend ready");
};

export const sendVerifyEmail = (email: string, name: string, token: string) =>
  sendEmail({
    from: FROM,
    to: email,
    subject: "Xác minh tài khoản SoftWhere",
    html: verifyEmailHtml(
      name,
      `${process.env.FRONTEND_URL}/verify-email?token=${token}`,
    ),
  });

export const sendResetPasswordEmail = (
  email: string,
  name: string,
  token: string,
) =>
  sendEmail({
    from: FROM,
    to: email,
    subject: "Đặt lại mật khẩu SoftWhere",
    html: resetPasswordHtml(
      name,
      `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
    ),
  });

export const sendReminderEmail = (
  email: string,
  name: string,
  taskTitle: string,
  dueDate: Date | null,
) =>
  sendEmail({
    from: FROM,
    to: email,
    subject: `Nhắc nhở deadline: "${taskTitle}"`,
    html: reminderEmailHtml(name, taskTitle, formatDueDate(dueDate)),
  });
