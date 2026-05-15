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
          task: true,
          user: {
            include: { settings: true },
          },
        },
      });

      for (const reminder of dueReminders) {
        if (!reminder.user?.email || !reminder.task) continue;
        if (!reminder.user?.settings?.notification_enabled) {
          continue;
        }
        await sendReminderEmail(
          reminder.user.email,
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
      }
    } catch (err) {
      console.error("[ReminderJob] Error:", err);
    }
  });

  console.log("[ReminderJob] Started — checking every minute.");
}

async function sendReminderEmail(
  to: string,
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
    from: `"TaskFlow" <${process.env.MAIL_USER}>`,
    to,
    subject: `⏰ Nhắc nhở: "${taskTitle}" sắp đến hạn!`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; 
                  padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h2 style="color: #2563eb; margin-bottom: 4px;">⏰ Nhắc nhở deadline</h2>
        <p style="color: #6b7280; font-size: 14px;">TaskFlow — Quản lý công việc cá nhân</p>
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 16px 0;" />
        <p style="font-size: 16px; color: #111827;">
          Công việc <strong>"${taskTitle}"</strong> sắp đến hạn.
        </p>
        <div style="background: #fef2f2; border-radius: 8px; padding: 12px 16px; margin: 16px 0;">
          <p style="margin: 0; color: #b91c1c; font-size: 14px;">
            📅 Deadline: <strong>${formattedDate}</strong>
          </p>
        </div>
        <p style="font-size: 13px; color: #9ca3af;">
          Đăng nhập TaskFlow để cập nhật tiến độ nhé!
        </p>
      </div>
    `,
  });
}
