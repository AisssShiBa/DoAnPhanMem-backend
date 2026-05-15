import type { Request, Response } from "express";
import prisma from "../config/prisma";

export const getNotifications = async (req: any, res: Response) => {
  try {
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
