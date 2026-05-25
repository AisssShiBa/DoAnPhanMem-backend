import type { Response } from "express";
import prisma from "../config/prisma";

export const getTags = async (req: any, res: Response) => {
  try {
    const tags = await prisma.tags.findMany({
      where: { user_id: req.user.id, is_deleted: false },
    });
    return res.status(200).json({ tags });
  } catch (error) {
    console.error("Lỗi getTags:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const createTag = async (req: any, res: Response) => {
  try {
    const { name, color_code } = req.body;
    const tagName = name?.trim();

    if (!tagName) {
      return res.status(400).json({ error: "Tên tag không được để trống" });
    }

    const existing = await prisma.tags.findFirst({
      where: {
        user_id: req.user.id,
        is_deleted: false,
        name: { equals: tagName, mode: "insensitive" },
      },
    });
    if (existing) {
      return res.status(409).json({ error: "Tag cá nhân đã tồn tại" });
    }

    const tag = await prisma.tags.create({
      data: {
        user_id: req.user.id,
        name: tagName,
        color_code: color_code ?? "#6366f1",
      },
    });

    return res.status(201).json({ message: "Tạo tag thành công", tag });
  } catch (error) {
    console.error("Lỗi createTag:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const deleteTag = async (req: any, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID tag không hợp lệ" });
    }

    const tag = await prisma.tags.findFirst({
      where: { id, user_id: req.user.id, is_deleted: false },
    });
    if (!tag) {
      return res.status(404).json({ error: "Không tìm thấy tag cá nhân" });
    }

    await prisma.task_Tags.deleteMany({
      where: { tag_id: id, task: { user_id: req.user.id } },
    });

    await prisma.tags.update({
      where: { id },
      data: { is_deleted: true },
    });

    return res.status(200).json({ message: "Xóa tag thành công" });
  } catch (error) {
    console.error("Lỗi deleteTag:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
export const addTagToTask = async (req: any, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const tagId = parseInt(req.params.tagId);

    // Kiểm tra task thuộc về user
    const task = await prisma.tasks.findFirst({
      where: { id: taskId, user_id: req.user.id, is_deleted: false },
    });
    if (!task) return res.status(404).json({ error: "Không tìm thấy task" });

    // Kiểm tra tag thuộc về user
    const tag = await prisma.tags.findFirst({
      where: { id: tagId, user_id: req.user.id, is_deleted: false },
    });
    if (!tag) return res.status(404).json({ error: "Không tìm thấy tag" });

    // Upsert để tránh duplicate
    await prisma.task_Tags.upsert({
      where: { task_id_tag_id: { task_id: taskId, tag_id: tagId } },
      create: { task_id: taskId, tag_id: tagId },
      update: {},
    });

    return res.status(200).json({ message: "Gán tag thành công" });
  } catch (error) {
    console.error("Lỗi addTagToTask:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

// Gỡ tag khỏi task
export const removeTagFromTask = async (req: any, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const tagId = parseInt(req.params.tagId);

    // Kiểm tra task thuộc về user
    const task = await prisma.tasks.findFirst({
      where: { id: taskId, user_id: req.user.id, is_deleted: false },
    });
    if (!task) return res.status(404).json({ error: "Không tìm thấy task" });

    await prisma.task_Tags.delete({
      where: { task_id_tag_id: { task_id: taskId, tag_id: tagId } },
    });

    return res.status(200).json({ message: "Gỡ tag thành công" });
  } catch (error) {
    console.error("Lỗi removeTagFromTask:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
