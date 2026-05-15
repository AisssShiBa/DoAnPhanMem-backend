import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* =========================
   GET STATS
   GET /dashboard/stats
========================= */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const [total, completed, inProgress] = await Promise.all([
      prisma.tasks.count({
        where: { user_id: userId, is_deleted: false },
      }),
      prisma.tasks.count({
        where: { user_id: userId, is_deleted: false, status: "completed" },
      }),
      prisma.tasks.count({
        where: { user_id: userId, is_deleted: false, status: "in_progress" },
      }),
    ]);

    res.json({ total, completed, inProgress });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};

/* =========================
   GET WEEKLY PERFORMANCE
   GET /dashboard/weekly
========================= */
export const getWeeklyPerformance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Lấy 7 ngày gần nhất (Thứ 2 → CN)
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const results = await Promise.all(
      days.map(async (day) => {
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);

        const [total, completed] = await Promise.all([
          prisma.tasks.count({
            where: {
              user_id: userId,
              is_deleted: false,
              created_at: { gte: day, lt: nextDay },
            },
          }),
          prisma.tasks.count({
            where: {
              user_id: userId,
              is_deleted: false,
              status: "completed",
              completed_at: { gte: day, lt: nextDay },
            },
          }),
        ]);

        return {
          date: day.toISOString().split("T")[0],
          total,
          completed,
          rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      }),
    );

    res.json({ weekly: results });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};

/* =========================
   GET RECENT TASKS
   GET /dashboard/recent-tasks
========================= */
export const getRecentTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const tasks = await prisma.tasks.findMany({
      where: { user_id: userId, is_deleted: false },
      orderBy: { created_at: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        status: true,
        due_date: true,
        priority: true,
      },
    });

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};
export const getCalendarTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // ← giống hệt các controller khác
    const { from, to } = req.query as { from: string; to: string };

    const tasks = await prisma.tasks.findMany({
      where: {
        user_id: userId,
        is_deleted: false,
        due_date: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      select: {
        id: true,
        title: true,
        due_date: true,
        status: true,
        priority: true,
        category_id: true,
        description: true,
        category: {
          select: {
            id: true,
            name: true,
            color_code: true,
          },
        },
      },
    });

    res.json({ tasks });
  } catch (error) {
    console.error("Lỗi getCalendarTasks:", error);
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
export const getDashboardFull = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const [total, done, overdue, upcomingTasks, categories] = await Promise.all(
      [
        prisma.tasks.count({
          where: { user_id: userId, is_deleted: false },
        }),
        prisma.tasks.count({
          where: { user_id: userId, is_deleted: false, status: "done" },
        }),
        prisma.tasks.count({
          where: {
            user_id: userId,
            is_deleted: false,
            status: { not: "done" },
            due_date: { lt: now },
          },
        }),
        prisma.tasks.findMany({
          where: {
            user_id: userId,
            is_deleted: false,
            status: { not: "done" },
            due_date: { gte: now, lte: in24h },
          },
          orderBy: { due_date: "asc" },
          select: {
            id: true,
            title: true,
            due_date: true,
            priority: true,
            category: {
              select: { id: true, name: true, color_code: true },
            },
          },
        }),
        prisma.categories.findMany({
          where: { user_id: userId, is_deleted: false },
          select: {
            id: true,
            name: true,
            color_code: true,
            tasks: {
              where: { is_deleted: false },
              select: { status: true },
            },
          },
        }),
      ],
    );

    const categoryStats = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      color_code: cat.color_code,
      total: cat.tasks.length,
      done: cat.tasks.filter((t) => t.status === "done").length,
    }));

    res.json({
      summary: {
        totalTasks: total,
        doneTasks: done,
        pendingTasks: total - done,
        completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
        overdueCount: overdue,
        doneThisWeek: 0,
        doneThisMonth: 0,
      },
      upcomingTasks,
      categoryStats,
    });
  } catch (err) {
    console.error("Lỗi getDashboardFull:", err);
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
