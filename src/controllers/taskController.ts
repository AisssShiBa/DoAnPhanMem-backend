import type { Request, Response } from "express";
import prisma from "../config/prisma";

// Lấy tất cả tasks của user
export const getTasks = async (req: any, res: Response) => {
  try {
    const tasks = await prisma.tasks.findMany({
      where: {
        user_id: req.user.id,
        is_deleted: false,
      },
      include: {
        category: true,
        subtasks: { where: { status: { not: "deleted" } } },
        task_tags: { include: { tag: true } },
      },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({ tasks });
  } catch (error) {
    console.error("Lỗi getTasks:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

// Tạo task mới
export const createTask = async (req: any, res: Response) => {
  try {
    const { title, description, category_id, priority, start_date, due_date } =
      req.body;

    if (!title) {
      return res.status(400).json({ error: "Tiêu đề không được để trống" });
    }

    const task = await prisma.tasks.create({
      data: {
        user_id: req.user.id,
        title,
        description,
        category_id: category_id || null,
        priority: priority || 0,
        start_date: start_date ? new Date(start_date) : null,
        due_date: due_date ? new Date(due_date) : null,
        status: "todo",
      },
      include: {
        category: true,
        subtasks: { where: { status: { not: "deleted" } } },
        task_tags: { include: { tag: true } },
        reminders: true,
      },
    });

    return res.status(201).json({ message: "Tạo task thành công", task });
  } catch (error) {
    console.error("Lỗi createTask:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

// Cập nhật task
export const updateTask = async (req: any, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const {
      title,
      description,
      category_id,
      priority,
      start_date,
      due_date,
      status,
    } = req.body;

    // Kiểm tra task thuộc về user
    const existing = await prisma.tasks.findFirst({
      where: { id: taskId, user_id: req.user.id, is_deleted: false },
    });

    if (!existing) {
      return res.status(404).json({ error: "Không tìm thấy task" });
    }

    const task = await prisma.tasks.update({
      where: { id: taskId },
      data: {
        title: title ?? existing.title,
        description:
          description !== undefined ? description : existing.description,
        category_id:
          category_id !== undefined ? category_id : existing.category_id,
        priority: priority ?? existing.priority,
        start_date:
          start_date !== undefined
            ? start_date
              ? new Date(start_date)
              : null
            : existing.start_date,
        due_date:
          due_date !== undefined
            ? due_date
              ? new Date(due_date)
              : null
            : existing.due_date,
        status: status ?? existing.status,
        completed_at: status === "done" ? new Date() : existing.completed_at,
        updated_at: new Date(),
      },
      include: {
        // ✅ Thêm include
        category: true,
        subtasks: { where: { status: { not: "deleted" } } },
        task_tags: { include: { tag: true } },
        reminders: true,
      },
    });

    return res.status(200).json({ message: "Cập nhật thành công", task });
  } catch (error) {
    console.error("Lỗi updateTask:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

// Xóa mềm task
export const deleteTask = async (req: any, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);

    const existing = await prisma.tasks.findFirst({
      where: { id: taskId, user_id: req.user.id, is_deleted: false },
    });

    if (!existing) {
      return res.status(404).json({ error: "Không tìm thấy task" });
    }

    await prisma.tasks.update({
      where: { id: taskId },
      data: { is_deleted: true, deleted_at: new Date() },
    });

    return res.status(200).json({ message: "Xóa task thành công" });
  } catch (error) {
    console.error("Lỗi deleteTask:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
export const getTaskById = async (req: any, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);

    const task = await prisma.tasks.findFirst({
      where: { id: taskId, user_id: req.user.id, is_deleted: false },
      include: {
        category: true,
        subtasks: {
          where: { status: { not: "deleted" } },
          orderBy: { created_at: "asc" },
        },
        task_tags: { include: { tag: true } },
        reminders: true,
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Không tìm thấy task" });
    }

    return res.status(200).json({ task });
  } catch (error) {
    console.error("Lỗi getTaskById:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
