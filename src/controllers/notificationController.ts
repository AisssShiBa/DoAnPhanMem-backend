import type { Request, Response } from "express";
import prisma from "../config/prisma";

const NOTIFICATION_RETENTION_DAYS = 30;
const MAX_NOTIFICATIONS_PER_USER = 50;

const cleanupUserNotifications = async (userId: number) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - NOTIFICATION_RETENTION_DAYS);

  await prisma.user_Notifications.deleteMany({
    where: {
      user_id: userId,
      is_read: true,
      created_at: { lt: cutoff },
    },
  });

  const overflow = await prisma.user_Notifications.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    skip: MAX_NOTIFICATIONS_PER_USER,
    select: { id: true },
  });

  if (overflow.length > 0) {
    await prisma.user_Notifications.deleteMany({
      where: {
        id: { in: overflow.map((n) => n.id) },
        is_read: true,
      },
    });
  }
};

export const getNotifications = async (req: any, res: Response) => {
  try {
    await cleanupUserNotifications(req.user.id);

    const notifications = await prisma.user_Notifications.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: "desc" },
      take: 20,
    });
    const unreadCount = await prisma.user_Notifications.count({
      where: { user_id: req.user.id, is_read: false },
    });
    return res.json({ notifications, unreadCount });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    await prisma.user_Notifications.updateMany({
      where: { id: Number(req.params.id), user_id: req.user.id },
      data: { is_read: true },
    });
    return res.json({ message: "Đã đọc" });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const markAllAsRead = async (req: any, res: Response) => {
  try {
    await prisma.user_Notifications.updateMany({
      where: { user_id: req.user.id, is_read: false },
      data: { is_read: true },
    });
    return res.json({ message: "Đã đọc tất cả" });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
