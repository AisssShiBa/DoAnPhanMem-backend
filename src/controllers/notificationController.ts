import type { Response } from "express";
import prisma from "../config/prisma";

const NOTIFICATION_RETENTION_DAYS = 30;
const MAX_NOTIFICATIONS_PER_USER = 100;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

const parsePositiveInt = (
  value: unknown,
  fallback: number,
  max = Number.MAX_SAFE_INTEGER,
) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

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

  const readOverflow = await prisma.user_Notifications.findMany({
    where: { user_id: userId, is_read: true },
    orderBy: { created_at: "desc" },
    skip: MAX_NOTIFICATIONS_PER_USER,
    select: { id: true },
  });

  if (readOverflow.length > 0) {
    await prisma.user_Notifications.deleteMany({
      where: { id: { in: readOverflow.map((n) => n.id) } },
    });
  }
};

export const getNotifications = async (req: any, res: Response) => {
  try {
    const userId = req.user.id as number;
    await cleanupUserNotifications(userId);

    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(
      req.query.limit,
      DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE,
    );
    const skip = (page - 1) * limit;

    const [notifications, unreadCount, total] = await Promise.all([
      prisma.user_Notifications.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.user_Notifications.count({
        where: { user_id: userId, is_read: false },
      }),
      prisma.user_Notifications.count({ where: { user_id: userId } }),
    ]);

    return res.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + notifications.length < total,
      },
    });
  } catch (error) {
    console.error("Lỗi getNotifications:", error);
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
  } catch (error) {
    console.error("Lỗi markAsRead:", error);
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
  } catch (error) {
    console.error("Lỗi markAllAsRead:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const clearReadNotifications = async (req: any, res: Response) => {
  try {
    const result = await prisma.user_Notifications.deleteMany({
      where: { user_id: req.user.id, is_read: true },
    });
    return res.json({
      message: "Đã xóa thông báo đã đọc",
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Lỗi clearReadNotifications:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
