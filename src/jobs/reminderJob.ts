import cron from "node-cron";
import prisma from "../config/prisma";
import { transporter } from "../services/mailService";

export function startReminderJob() {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const dueReminders = await prisma.reminders.findMany({
        where: {
          status: "pending",
          remind_time: { lte: now },
        },
        include: {
          task: {
            select: {
              title: true,
              due_date: true,
              is_deleted: true,
            },
          },
          user: {
            select: {
              email: true,
              full_name: true,
              status: true,
              settings: {
                select: { notification_enabled: true },
              },
            },
          },
        },
      });

      for (const reminder of dueReminders) {
        // ── Task hoặc user không hợp lệ → skip ─────────────────
        if (!reminder.user?.email || !reminder.task) {
          await prisma.reminders.update({
            where: { id: reminder.id },
            data: { status: "skipped" },
          });
          continue;
        }

        // ── Task đã bị xóa mềm → skip ──────────────────────────
        if (reminder.task.is_deleted) {
          await prisma.reminders.update({
            where: { id: reminder.id },
            data: { status: "skipped" },
          });
          continue;
        }

        // ── User bị khóa → skip ────────────────────────────────
        if (reminder.user.status === "BANNED") {
          await prisma.reminders.update({
            where: { id: reminder.id },
            data: { status: "skipped" },
          });
          continue;
        }

        // ── FIX: User tắt thông báo → phải update status,
        //    không thì lần sau cron vẫn pick lại → vòng lặp vô tận
        const notifEnabled =
          reminder.user.settings?.notification_enabled ?? true;

        if (!notifEnabled) {
          await prisma.reminders.update({
            where: { id: reminder.id },
            data: { status: "skipped" },
          });
          console.log(
            `[ReminderJob] Skipped (notif off): "${reminder.task.title}" → ${reminder.user.email}`,
          );
          continue;
        }

        // ── Gửi email ──────────────────────────────────────────
        try {
          await sendReminderEmail(
            reminder.user.email,
            reminder.user.full_name ?? reminder.user.email,
            reminder.task.title,
            reminder.task.due_date,
          );

          await prisma.reminders.update({
            where: { id: reminder.id },
            data: { status: "sent" },
          });

          console.log(
            `[ReminderJob] Sent: "${reminder.task.title}" → ${reminder.user.email}`,
          );
        } catch (mailErr) {
          // Gửi mail thất bại → đánh dấu failed, không retry vô hạn
          await prisma.reminders.update({
            where: { id: reminder.id },
            data: { status: "failed" },
          });
          console.error(
            `[ReminderJob] Mail failed for reminder #${reminder.id}:`,
            mailErr,
          );
        }
      }
    } catch (err) {
      console.error("[ReminderJob] Error:", err);
    }
  });

  console.log("[ReminderJob] Started — checking every minute.");
}

// ─────────────────────────────────────────────────────────────
async function sendReminderEmail(
  to: string,
  name: string,
  taskTitle: string,
  dueDate: Date | null,
) {
  const formattedDate = dueDate
    ? dueDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Chưa đặt deadline";

  await transporter.sendMail({
    from: `"SoftWhere" <${process.env.MAIL_USER}>`,
    to,
    subject: `⏰ Nhắc nhở: "${taskTitle}" sắp đến hạn!`,
    html: `
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
      </div>`,
  });
}
