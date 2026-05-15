import type { Request, Response } from "express";
import prisma from "../config/prisma";

/* ─────────────────────────────────────────
   GET /tasks/:taskId/subtasks
───────────────────────────────────────── */
export const getSubtasks = async (req: any, res: Response) => {
  try {
    const taskId = parseInt(String(req.params.taskId));
    if (isNaN(taskId)) {
      return res.status(400).json({ error: "taskId không hợp lệ" });
    }

    // Xác minh task tồn tại và thuộc user
    const task = await prisma.tasks.findFirst({
      where: { id: taskId, user_id: req.user.id, is_deleted: false },
    });
    if (!task) {
      return res.status(404).json({ error: "Không tìm thấy task" });
    }

    const subtasks = await prisma.subTasks.findMany({
      where: { task_id: taskId, status: { not: "deleted" } },
      orderBy: { created_at: "asc" },
    });

    return res.status(200).json({ subtasks });
  } catch (error) {
    console.error("Lỗi getSubtasks:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/* ─────────────────────────────────────────
   POST /tasks/:taskId/subtasks
───────────────────────────────────────── */
export const createSubtask = async (req: any, res: Response) => {
  try {
    const taskId = parseInt(String(req.params.taskId));
    if (isNaN(taskId)) {
      return res.status(400).json({ error: "taskId không hợp lệ" });
    }

    const { title } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: "Tên subtask không được để trống" });
    }

    // Xác minh task tồn tại và thuộc user
    const task = await prisma.tasks.findFirst({
      where: { id: taskId, user_id: req.user.id, is_deleted: false },
    });
    if (!task) {
      return res.status(404).json({ error: "Không tìm thấy task" });
    }

    const subtask = await prisma.subTasks.create({
      data: {
        task_id: taskId,
        title: title.trim(),
        status: "todo",
      },
    });

    return res.status(201).json({ message: "Tạo subtask thành công", subtask });
  } catch (error) {
    console.error("Lỗi createSubtask:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/* ─────────────────────────────────────────
   PATCH /tasks/:taskId/subtasks/:subtaskId
───────────────────────────────────────── */
export const updateSubtask = async (req: any, res: Response) => {
  try {
    const taskId = parseInt(String(req.params.taskId));
    const subtaskId = parseInt(String(req.params.subtaskId));

    if (isNaN(taskId) || isNaN(subtaskId)) {
      return res.status(400).json({ error: "ID không hợp lệ" });
    }

    // Xác minh subtask thuộc task và task thuộc user
    const subtask = await prisma.subTasks.findFirst({
      where: {
        id: subtaskId,
        task_id: taskId,
        task: { user_id: req.user.id, is_deleted: false },
      },
    });
    if (!subtask) {
      return res.status(404).json({ error: "Không tìm thấy subtask" });
    }

    const { title, status } = req.body;

    const updateData: {
      updated_at: Date;
      title?: string;
      status?: string;
      completed_at?: Date | null;
    } = { updated_at: new Date() };

    if (title !== undefined) {
      if (!title.trim()) {
        return res
          .status(400)
          .json({ error: "Tên subtask không được để trống" });
      }
      updateData.title = title.trim();
    }

    if (status !== undefined) {
      const VALID_STATUSES = ["todo", "done"];
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: "Trạng thái không hợp lệ" });
      }
      updateData.status = status;
      updateData.completed_at = status === "done" ? new Date() : null;
    }

    const updated = await prisma.subTasks.update({
      where: { id: subtaskId },
      data: updateData,
    });

    return res
      .status(200)
      .json({ message: "Cập nhật subtask thành công", subtask: updated });
  } catch (error) {
    console.error("Lỗi updateSubtask:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/* ─────────────────────────────────────────
   DELETE /tasks/:taskId/subtasks/:subtaskId
───────────────────────────────────────── */
export const deleteSubtask = async (req: any, res: Response) => {
  try {
    const taskId = parseInt(String(req.params.taskId));
    const subtaskId = parseInt(String(req.params.subtaskId));

    if (isNaN(taskId) || isNaN(subtaskId)) {
      return res.status(400).json({ error: "ID không hợp lệ" });
    }

    // Xác minh subtask thuộc task và task thuộc user
    const subtask = await prisma.subTasks.findFirst({
      where: {
        id: subtaskId,
        task_id: taskId,
        task: { user_id: req.user.id, is_deleted: false },
      },
    });
    if (!subtask) {
      return res.status(404).json({ error: "Không tìm thấy subtask" });
    }

    // Hard delete (subtask không cần soft delete)
    await prisma.subTasks.delete({ where: { id: subtaskId } });

    return res.status(200).json({ message: "Xóa subtask thành công" });
  } catch (error) {
    console.error("Lỗi deleteSubtask:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
