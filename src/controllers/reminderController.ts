import { type Response } from "express";
import prisma from "../config/prisma";

export const getReminders = async (req: any, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId);

    const task = await prisma.tasks.findFirst({
      where: { id: taskId, user_id: req.user.id, is_deleted: false },
    });
    if (!task) {
      return res.status(404).json({ error: "Không tìm thấy task" });
    }

    const reminders = await prisma.reminders.findMany({
      where: { task_id: taskId, user_id: req.user.id },
      orderBy: { remind_time: "asc" },
    });

    return res.status(200).json({ reminders });
  } catch (error) {
    console.error("Lỗi getReminders:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const createReminder = async (req: any, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const { remind_time } = req.body;

    if (!remind_time) {
      return res
        .status(400)
        .json({ error: "Thời gian nhắc nhở không được để trống" });
    }

    const task = await prisma.tasks.findFirst({
      where: { id: taskId, user_id: req.user.id, is_deleted: false },
    });
    if (!task) {
      return res.status(404).json({ error: "Không tìm thấy task" });
    }

    const settings = await prisma.user_Settings.findUnique({
      where: { user_id: req.user.id },
      select: { notification_enabled: true },
    });
    if (settings?.notification_enabled === false) {
      return res.status(403).json({
        error: "Bạn đã tắt thông báo trong cài đặt nên không thể tạo nhắc nhở",
      });
    }

    const remindDate = new Date(remind_time);
    if (isNaN(remindDate.getTime())) {
      return res.status(400).json({ error: "Thời gian nhắc nhở không hợp lệ" });
    }

    // ✅ Buffer 60 giây để tránh reject do clock lệch client/server
    const now = new Date();
    now.setMinutes(now.getMinutes() - 3);

    if (remindDate < now) {
      return res.status(400).json({ error: "Thời gian nhắc nhở đã qua" });
    }

    const reminder = await prisma.reminders.create({
      data: {
        task_id: taskId,
        user_id: req.user.id,
        remind_time: remindDate,
        status: "pending",
      },
    });

    return res
      .status(201)
      .json({ message: "Đặt nhắc nhở thành công", reminder });
  } catch (error) {
    console.error("Lỗi createReminder:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const deleteReminder = async (req: any, res: Response) => {
  try {
    const reminderId = parseInt(req.params.reminderId);

    const existing = await prisma.reminders.findFirst({
      where: { id: reminderId, user_id: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ error: "Không tìm thấy reminder" });
    }

    await prisma.reminders.delete({ where: { id: reminderId } });

    return res.status(200).json({ message: "Xóa nhắc nhở thành công" });
  } catch (error) {
    console.error("Lỗi deleteReminder:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
