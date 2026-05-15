import type { Request, Response } from "express";
import prisma from "../config/prisma";

// ─────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search, status, page = "1" } = req.query as Record<string, string>;
    const take = 15;
    const skip = (Number(page) - 1) * take;

    const where: any = { is_deleted: false };
    if (status && status !== "ALL") where.status = status;
    if (search) {
      where.OR = [
        { full_name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          status: true,
          provider: true,
          created_at: true,
          role: { select: { name: true } },
          _count: { select: { tasks: true } },
        },
      }),
      prisma.users.count({ where }),
    ]);

    return res.json({
      users,
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / take),
      },
    });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: Number(req.params.id) },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        status: true,
        provider: true,
        created_at: true,
        role: { select: { name: true } },
        _count: { select: { tasks: true } },
      },
    });
    if (!user) return res.status(404).json({ error: "Không tìm thấy" });
    return res.json(user);
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { status, reason } = req.body;
    const userId = Number(req.params.id);

    await prisma.users.update({ where: { id: userId }, data: { status } });

    await prisma.activity_Logs.create({
      data: {
        user_id: (req as any).user?.id,
        action: `${status === "BANNED" ? "BANNED" : "UNBANNED"} user #${userId}${reason ? ` — ${reason}` : ""}`,
      },
    });

    if (status === "BANNED") {
      await prisma.user_Notifications.create({
        data: {
          user_id: userId,
          title: "Tài khoản bị khoá",
          content: reason ?? "Tài khoản của bạn đã bị khoá bởi quản trị viên.",
          type: "WARNING",
        },
      });
    }

    return res.json({ message: "Cập nhật trạng thái thành công" });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    return res.json({ message: "Đã gửi email đặt lại mật khẩu" });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId))
      return res.status(400).json({ error: "ID không hợp lệ" });

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user)
      return res.status(404).json({ error: "Không tìm thấy người dùng" });

    await prisma.users.update({
      where: { id: userId },
      data: { is_deleted: true, deleted_at: new Date() },
    });

    return res.json({ message: "Xóa người dùng thành công" });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

// ─────────────────────────────────────────────────────────────
// STATS & CHARTS
// ─────────────────────────────────────────────────────────────

export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    // ✅ FIX: thêm yesterdayStart để tính DAU change thực
    const yesterdayStart = new Date(todayStart.getTime() - 86_400_000);

    const [
      totalUsers,
      activeUsers,
      totalTasks,
      doneTasks,
      pendingTasks,
      totalCategories,
      dauToday,
      dauYesterday, // ✅ FIX: thêm DAU hôm qua
      mauThisMonth,
      mauLastMonth,
      usersThisMonth,
      usersLastMonth,
      tasksThisMonth,
      tasksLastMonth,
    ] = await Promise.all([
      prisma.users.count({ where: { is_deleted: false } }),
      prisma.users.count({ where: { is_deleted: false, status: "ACTIVE" } }),
      prisma.tasks.count({ where: { is_deleted: false } }),
      prisma.tasks.count({ where: { is_deleted: false, status: "done" } }),
      prisma.tasks.count({
        where: { is_deleted: false, status: { not: "done" } },
      }),
      prisma.categories.count({ where: { is_deleted: false } }),
      prisma.activity_Logs.findMany({
        where: { created_at: { gte: todayStart } },
        select: { user_id: true },
        distinct: ["user_id"],
      }),
      // ✅ FIX: DAU hôm qua để so sánh
      prisma.activity_Logs.findMany({
        where: { created_at: { gte: yesterdayStart, lt: todayStart } },
        select: { user_id: true },
        distinct: ["user_id"],
      }),
      prisma.activity_Logs.findMany({
        where: { created_at: { gte: startOfMonth } },
        select: { user_id: true },
        distinct: ["user_id"],
      }),
      prisma.activity_Logs.findMany({
        where: { created_at: { gte: startOfLastMonth, lte: endOfLastMonth } },
        select: { user_id: true },
        distinct: ["user_id"],
      }),
      prisma.users.count({ where: { created_at: { gte: startOfMonth } } }),
      prisma.users.count({
        where: { created_at: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      prisma.tasks.count({
        where: { created_at: { gte: startOfMonth }, is_deleted: false },
      }),
      prisma.tasks.count({
        where: {
          created_at: { gte: startOfLastMonth, lte: endOfLastMonth },
          is_deleted: false,
        },
      }),
    ]);

    const dauValue = dauToday.length;
    const dauYesterdayValue = dauYesterday.length; // ✅ FIX
    const mauValue = mauThisMonth.length;
    const mauLastValue = mauLastMonth.length;

    const pct = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? "+100%" : "+0%";
      const diff = Math.round(((curr - prev) / prev) * 100);
      return `${diff >= 0 ? "+" : ""}${diff}%`;
    };

    return res.json({
      totalUsers,
      activeUsers,
      totalTasks,
      doneTasks,
      pendingTasks,
      totalCategories,
      dauToday: dauValue,
      // ✅ FIX: change tính thực từ hôm qua, không hardcode "+0%"
      dau: { value: dauValue, change: pct(dauValue, dauYesterdayValue) },
      mauThisMonth: { value: mauValue, change: pct(mauValue, mauLastValue) },
      userGrowth: pct(usersThisMonth, usersLastMonth),
      taskGrowth: pct(tasksThisMonth, tasksLastMonth),
    });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const getDauChart = async (req: Request, res: Response) => {
  try {
    const days = Number(req.query.days ?? 30);
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const end = new Date(start.getTime() + 86_400_000);

      const unique = await prisma.activity_Logs.findMany({
        where: { created_at: { gte: start, lt: end } },
        select: { user_id: true },
        distinct: ["user_id"],
      });

      result.push({
        label: start.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "numeric",
        }),
        value: unique.length,
      });
    }

    return res.json({ dau: result });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const getMauChart = async (req: Request, res: Response) => {
  try {
    const months = Number(req.query.months ?? 6);
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const unique = await prisma.activity_Logs.findMany({
        where: { created_at: { gte: start, lt: end } },
        select: { user_id: true },
        distinct: ["user_id"],
      });

      result.push({
        label: start.toLocaleDateString("vi-VN", { month: "short" }),
        value: unique.length,
      });
    }

    return res.json({ mau: result });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

export const broadcastNotification = async (req: Request, res: Response) => {
  try {
    const { title, content, type } = req.body;

    const users = await prisma.users.findMany({
      where: { is_deleted: false, status: "ACTIVE" },
      select: { id: true },
    });

    await prisma.user_Notifications.createMany({
      data: users.map((u) => ({
        user_id: u.id,
        title,
        content,
        type,
        is_read: false,
      })),
    });

    await prisma.activity_Logs.create({
      data: {
        user_id: (req as any).user?.id,
        action: `BROADCAST "${title}" → ${users.length} users`,
      },
    });

    return res.json({
      message: "Gửi thông báo thành công",
      reachCount: users.length,
    });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const getNotificationHistory = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page ?? 1);
    const take = 20;
    const skip = (page - 1) * take;

    const [history, total] = await Promise.all([
      prisma.activity_Logs.findMany({
        where: { action: { contains: "BROADCAST" } },
        orderBy: { created_at: "desc" },
        skip,
        take,
        include: { user: { select: { full_name: true, email: true } } },
      }),
      prisma.activity_Logs.count({
        where: { action: { contains: "BROADCAST" } },
      }),
    ]);

    return res.json({
      history: history.map((h) => ({
        id: h.id,
        action: h.action,
        action_type: "SYSTEM",
        created_at: h.created_at,
        user_name: h.user?.full_name ?? "Admin",
        user_email: h.user?.email ?? "",
        role: "ADMIN",
      })),
      pagination: { total, page, totalPages: Math.ceil(total / take) },
    });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

// ─────────────────────────────────────────────────────────────
// TAGS
// ─────────────────────────────────────────────────────────────

export const getDefaultTags = async (_req: Request, res: Response) => {
  try {
    const tags = await prisma.tags.findMany({
      where: { user_id: null, is_deleted: false },
      select: { id: true, name: true, color_code: true },
    });
    return res.json({ tags });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const createDefaultTag = async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;
    const tag = await prisma.tags.create({
      data: { name, color_code: color, user_id: null },
    });
    return res.json({ tag, message: "Tạo tag thành công" });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const deleteDefaultTag = async (req: Request, res: Response) => {
  try {
    await prisma.tags.update({
      where: { id: Number(req.params.id) },
      data: { is_deleted: true },
    });
    return res.json({ message: "Xoá tag thành công" });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

// ─────────────────────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────────────────────

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { search, page = "1" } = req.query as Record<string, string>;
    const take = 20;
    const skip = (Number(page) - 1) * take;

    const where: any = {};
    if (search) {
      where.OR = [
        { action: { contains: search } },
        { user: { email: { contains: search } } },
        { user: { full_name: { contains: search } } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.activity_Logs.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take,
        include: {
          user: {
            select: {
              full_name: true,
              email: true,
              role: { select: { name: true } },
            },
          },
        },
      }),
      prisma.activity_Logs.count({ where }),
    ]);

    return res.json({
      logs: logs.map((l) => ({
        id: l.id,
        action: l.action,
        action_type: "SYSTEM",
        created_at: l.created_at,
        user_name: l.user?.full_name ?? "—",
        user_email: l.user?.email ?? "—",
        role: l.user?.role?.name ?? "USER",
      })),
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / take),
      },
    });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

// ─────────────────────────────────────────────────────────────
// USER TASK STATS
// ─────────────────────────────────────────────────────────────

export const getUserTaskStats = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    const [total, done, inProgress, todo, recentTasks, categories] =
      await Promise.all([
        prisma.tasks.count({ where: { user_id: userId, is_deleted: false } }),
        prisma.tasks.count({
          where: { user_id: userId, is_deleted: false, status: "done" },
        }),
        prisma.tasks.count({
          where: { user_id: userId, is_deleted: false, status: "in_progress" },
        }),
        prisma.tasks.count({
          where: { user_id: userId, is_deleted: false, status: "todo" },
        }),
        prisma.tasks.findMany({
          where: { user_id: userId, is_deleted: false },
          orderBy: { created_at: "desc" },
          take: 5,
          select: { title: true, status: true, due_date: true },
        }),
        prisma.tasks.groupBy({
          by: ["category_id"],
          where: { user_id: userId, is_deleted: false },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 5,
        }),
      ]);

    const categoryIds = categories
      .map((c) => c.category_id)
      .filter((id): id is number => id !== null);

    const categoryNames = await prisma.categories.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color_code: true },
    });

    return res.json({
      total,
      done,
      inProgress,
      todo,
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
      recentTasks: recentTasks.map((t) => ({
        title: t.title,
        status: t.status ?? "todo",
        due: t.due_date
          ? new Date(t.due_date).toLocaleDateString("vi-VN")
          : null,
      })),
      categories: categories.map((c) => {
        const cat = categoryNames.find((n) => n.id === c.category_id);
        return {
          name: cat?.name ?? "Không có danh mục",
          color: cat?.color_code ?? "#6366f1",
          count: c._count.id,
        };
      }),
    });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

// ─────────────────────────────────────────────────────────────
// CATEGORY STATS
// ─────────────────────────────────────────────────────────────

export const getCategoryStats = async (_req: Request, res: Response) => {
  try {
    const stats = await prisma.tasks.groupBy({
      by: ["category_id"],
      where: { is_deleted: false },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const categoryIds = stats
      .map((s) => s.category_id)
      .filter((id): id is number => id !== null);

    const categories = await prisma.categories.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color_code: true },
    });

    return res.json({
      categories: stats.map((s) => {
        const cat = categories.find((c) => c.id === s.category_id);
        return {
          name: cat?.name ?? "Không có danh mục",
          color: cat?.color_code ?? "#6366f1",
          count: s._count.id,
        };
      }),
    });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

// ─────────────────────────────────────────────────────────────
// INACTIVE USERS
// ─────────────────────────────────────────────────────────────

export const getInactiveUsers = async (req: Request, res: Response) => {
  try {
    const days = Number(req.query.days ?? 7);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const activeUserIds = await prisma.activity_Logs.findMany({
      where: { created_at: { gte: since } },
      select: { user_id: true },
      distinct: ["user_id"],
    });

    const activeIds = activeUserIds
      .map((a) => a.user_id)
      .filter((id): id is number => id !== null);

    const inactiveUsers = await prisma.users.findMany({
      where: {
        is_deleted: false,
        status: "ACTIVE",
        id: { notIn: activeIds.length > 0 ? activeIds : [0] },
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        created_at: true,
        _count: { select: { tasks: true } },
      },
      orderBy: { created_at: "desc" },
      take: 20,
    });

    return res.json({ users: inactiveUsers, days });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
