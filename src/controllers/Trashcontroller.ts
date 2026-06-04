import type { Response } from "express";
import prisma from "../config/prisma";
import { deleteLocalUploadByUrl } from "../utils/localFileStorage";

const getUserId = (req: any): number | null => req.user?.id ?? null;

const deleteTaskRelations = async (taskIds: number[]) => {
  const attachments = await prisma.task_Attachments.findMany({
    where: { task_id: { in: taskIds } },
    select: { file_url: true },
  });

  await prisma.$transaction([
    prisma.reminders.deleteMany({ where: { task_id: { in: taskIds } } }),
    prisma.task_Tags.deleteMany({ where: { task_id: { in: taskIds } } }),
    prisma.subTasks.deleteMany({ where: { task_id: { in: taskIds } } }),
    prisma.task_Attachments.deleteMany({ where: { task_id: { in: taskIds } } }),
    prisma.tasks.deleteMany({ where: { id: { in: taskIds } } }),
  ]);

  attachments.forEach((attachment) => {
    try {
      deleteLocalUploadByUrl(attachment.file_url);
    } catch (error) {
      console.error("delete attachment file ERROR:", error);
    }
  });
};

export const getTrash = async (req: any, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const tasks = await prisma.tasks.findMany({
      where: {
        user_id: userId,
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

    return res.status(200).json({ tasks });
  } catch (error) {
    console.error("getTrash ERROR:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const restoreTask = async (req: any, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const taskId = Number(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: "ID task không hợp lệ" });
    }

    const task = await prisma.tasks.findFirst({
      where: {
        id: taskId,
        user_id: userId,
        is_deleted: true,
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Không tìm thấy task" });
    }

    const restored = await prisma.tasks.update({
      where: { id: taskId },
      data: {
        is_deleted: false,
        deleted_at: null,
      },
    });

    return res.status(200).json({ task: restored });
  } catch (error) {
    console.error("restoreTask ERROR:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const permanentDelete = async (req: any, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const taskId = Number(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: "ID task không hợp lệ" });
    }

    const task = await prisma.tasks.findFirst({
      where: {
        id: taskId,
        user_id: userId,
        is_deleted: true,
      },
      select: { id: true },
    });

    if (!task) {
      return res.status(404).json({ message: "Không tìm thấy task" });
    }

    await deleteTaskRelations([taskId]);

    return res.status(200).json({ message: "Đã xóa vĩnh viễn" });
  } catch (error) {
    console.error("permanentDelete ERROR:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const emptyTrash = async (req: any, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const tasks = await prisma.tasks.findMany({
      where: {
        user_id: userId,
        is_deleted: true,
      },
      select: { id: true },
    });

    if (tasks.length === 0) {
      return res.status(200).json({ message: "Thùng rác đang trống" });
    }

    await deleteTaskRelations(tasks.map((task) => task.id));

    return res.status(200).json({ message: `Đã xóa ${tasks.length} task` });
  } catch (error) {
    console.error("emptyTrash ERROR:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const restoreAll = async (req: any, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const result = await prisma.tasks.updateMany({
      where: {
        user_id: userId,
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
    return res.status(500).json({ message: "Lỗi server" });
  }
};
