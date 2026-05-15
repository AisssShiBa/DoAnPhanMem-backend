import type { Response } from "express";
import prisma from "../config/prisma";

/* =====================================================
   GET TRASH
===================================================== */
export const getTrash = async (req: any, res: Response) => {
  try {
    console.log("===== GET TRASH =====");
    console.log("REQ.USER:", req.user);

    // ✅ kiểm tra user
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Chưa đăng nhập",
      });
    }

    const tasks = await prisma.tasks.findMany({
      where: {
        user_id: req.user.id,
        is_deleted: true,
      },

      orderBy: {
        deleted_at: "desc",
      },

      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        due_date: true,
        deleted_at: true,

        category: {
          select: {
            id: true,
            name: true,
            color_code: true,
          },
        },
      },
    });

    return res.status(200).json({
      tasks,
    });
  } catch (error) {
    console.error("===== GET TRASH ERROR =====");
    console.error(error);

    return res.status(500).json({
      message: "Lỗi server",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/* =====================================================
   RESTORE TASK
===================================================== */
export const restoreTask = async (req: any, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Chưa đăng nhập",
      });
    }

    const taskId = Number(req.params.id);

    const task = await prisma.tasks.findFirst({
      where: {
        id: taskId,
        user_id: req.user.id,
        is_deleted: true,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Không tìm thấy task",
      });
    }

    const restored = await prisma.tasks.update({
      where: {
        id: taskId,
      },

      data: {
        is_deleted: false,
        deleted_at: null,
      },
    });

    return res.status(200).json({
      task: restored,
    });
  } catch (error) {
    console.error("restoreTask ERROR:", error);

    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

/* =====================================================
   DELETE PERMANENT
===================================================== */
export const permanentDelete = async (req: any, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Chưa đăng nhập",
      });
    }

    const taskId = Number(req.params.id);

    const task = await prisma.tasks.findFirst({
      where: {
        id: taskId,
        user_id: req.user.id,
        is_deleted: true,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Không tìm thấy task",
      });
    }

    await prisma.tasks.delete({
      where: {
        id: taskId,
      },
    });

    return res.status(200).json({
      message: "Đã xóa vĩnh viễn",
    });
  } catch (error) {
    console.error("permanentDelete ERROR:", error);

    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

/* =====================================================
   EMPTY TRASH
===================================================== */
export const emptyTrash = async (req: any, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Chưa đăng nhập",
      });
    }

    const result = await prisma.tasks.deleteMany({
      where: {
        user_id: req.user.id,
        is_deleted: true,
      },
    });

    return res.status(200).json({
      message: `Đã xóa ${result.count} task`,
    });
  } catch (error) {
    console.error("emptyTrash ERROR:", error);

    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

/* =====================================================
   RESTORE ALL
===================================================== */
export const restoreAll = async (req: any, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Chưa đăng nhập",
      });
    }

    const result = await prisma.tasks.updateMany({
      where: {
        user_id: req.user.id,
        is_deleted: true,
      },

      data: {
        is_deleted: false,
        deleted_at: null,
      },
    });

    return res.status(200).json({
      message: `Đã khôi phục ${result.count} task`,
    });
  } catch (error) {
    console.error("restoreAll ERROR:", error);

    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};
