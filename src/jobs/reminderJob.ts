import cron from "node-cron";
import prisma from "../config/prisma";
import { sendReminderEmail } from "../services/mailService";

let isReminderJobRunning = false;

export async function processDueReminders() {
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
          id: true,
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

  if (dueReminders.length > 0) {
    console.log(`[ReminderJob] Found ${dueReminders.length} due reminder(s).`);
  }

  for (const reminder of dueReminders) {
    if (!reminder.user?.email || !reminder.task) {
      await prisma.reminders.update({
        where: { id: reminder.id },
        data: { status: "skipped" },
      });
      console.log(`[ReminderJob] Skipped #${reminder.id}: missing user/task.`);
      continue;
    }

    if (reminder.task.is_deleted) {
      await prisma.reminders.update({
        where: { id: reminder.id },
        data: { status: "skipped" },
      });
      console.log(`[ReminderJob] Skipped #${reminder.id}: task deleted.`);
      continue;
    }

    if (reminder.user.status !== "ACTIVE") {
      await prisma.reminders.update({
        where: { id: reminder.id },
        data: { status: "skipped" },
      });
      console.log(`[ReminderJob] Skipped #${reminder.id}: user inactive.`);
      continue;
    }

    const notifEnabled = reminder.user.settings?.notification_enabled ?? true;
    if (!notifEnabled) {
      await prisma.reminders.update({
        where: { id: reminder.id },
        data: { status: "skipped" },
      });
      console.log(
        `[ReminderJob] Skipped #${reminder.id} (notif off): "${reminder.task.title}" -> ${reminder.user.email}`,
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

      try {
        await prisma.user_Notifications.create({
          data: {
            user_id: reminder.user.id,
            title: "Nhắc nhở deadline",
            content: `Công việc "${reminder.task.title}" sắp đến hạn.`,
            type: "REMINDER",
            is_read: false,
          },
        });
      } catch (notificationErr) {
        console.error(
          `[ReminderJob] Notification create failed for reminder #${reminder.id}:`,
          notificationErr,
        );
      }

      console.log(
        `[ReminderJob] Sent #${reminder.id}: "${reminder.task.title}" -> ${reminder.user.email}`,
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
}

export function startReminderJob() {
  cron.schedule("* * * * *", async () => {
    if (isReminderJobRunning) {
      console.log("[ReminderJob] Previous run still active, skip this tick.");
      return;
    }

    isReminderJobRunning = true;
    try {
      await processDueReminders();
    } catch (err) {
      console.error("[ReminderJob] Error:", err);
    } finally {
      isReminderJobRunning = false;
    }
  });

  console.log("[ReminderJob] Started - checking every minute.");
}
