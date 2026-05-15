import cron from "node-cron";
import prisma from "../config/prisma";
import { sendReminderEmail } from "../services/mailService";

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
        if (!reminder.user?.email || !reminder.task) {
          await prisma.reminders.update({
            where: { id: reminder.id },
            data: { status: "skipped" },
          });
          continue;
        }

        if (reminder.task.is_deleted) {
          await prisma.reminders.update({
            where: { id: reminder.id },
            data: { status: "skipped" },
          });
          continue;
        }

        if (reminder.user.status === "BANNED") {
          await prisma.reminders.update({
            where: { id: reminder.id },
            data: { status: "skipped" },
          });
          continue;
        }

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
