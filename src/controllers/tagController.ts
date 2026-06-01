import type { Response } from "express";
import prisma from "../config/prisma";

const getTaskWithRelations = (taskId: number, userId: number) =>
  prisma.tasks.findFirst({
    where: { id: taskId, user_id: userId, is_deleted: false },
    include: {
      category: true,
      subtasks: {
        where: { status: { not: "deleted" } },
        orderBy: { created_at: "asc" },
      },
      task_tags: { include: { tag: true } },
      reminders: true,
      attachments: true,
    },
  });

export const getTags = async (req: any, res: Response) => {
  try {
    const tags = await prisma.tags.findMany({
      where: { user_id: req.user.id, is_deleted: false },
      orderBy: { id: "desc" },
    });
    return res.status(200).json({ tags });
  } catch (error) {
    console.error("Loi getTags:", error);
    return res.status(500).json({ error: "Loi he thong" });
  }
};

export const createTag = async (req: any, res: Response) => {
  try {
    const { name, color_code } = req.body;
    const tagName = name?.trim();

    if (!tagName) {
      return res.status(400).json({ error: "Ten tag khong duoc de trong" });
    }

    const existing = await prisma.tags.findFirst({
      where: {
        user_id: req.user.id,
        is_deleted: false,
        name: { equals: tagName, mode: "insensitive" },
      },
    });

    if (existing) {
      return res.status(409).json({ error: "Tag ca nhan da ton tai" });
    }

    const tag = await prisma.tags.create({
      data: {
        user_id: req.user.id,
        name: tagName,
        color_code: color_code ?? "#6366f1",
      },
    });

    return res.status(201).json({ message: "Tao tag thanh cong", tag });
  } catch (error) {
    console.error("Loi createTag:", error);
    return res.status(500).json({ error: "Loi he thong" });
  }
};

export const deleteTag = async (req: any, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID tag khong hop le" });
    }

    const tag = await prisma.tags.findFirst({
      where: { id, user_id: req.user.id, is_deleted: false },
    });
    if (!tag) {
      return res.status(404).json({ error: "Khong tim thay tag ca nhan" });
    }

    await prisma.task_Tags.deleteMany({
      where: { tag_id: id, task: { user_id: req.user.id } },
    });

    await prisma.tags.update({
      where: { id },
      data: { is_deleted: true },
    });

    return res.status(200).json({ message: "Xoa tag thanh cong" });
  } catch (error) {
    console.error("Loi deleteTag:", error);
    return res.status(500).json({ error: "Loi he thong" });
  }
};

export const addTagToTask = async (req: any, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const tagId = parseInt(req.params.tagId);

    if (isNaN(taskId) || isNaN(tagId)) {
      return res.status(400).json({ error: "ID task hoac tag khong hop le" });
    }

    const task = await prisma.tasks.findFirst({
      where: { id: taskId, user_id: req.user.id, is_deleted: false },
    });
    if (!task) {
      return res.status(404).json({ error: "Khong tim thay task" });
    }

    const tag = await prisma.tags.findFirst({
      where: { id: tagId, user_id: req.user.id, is_deleted: false },
    });
    if (!tag) {
      return res.status(404).json({ error: "Khong tim thay tag" });
    }

    await prisma.task_Tags.upsert({
      where: { task_id_tag_id: { task_id: taskId, tag_id: tagId } },
      create: { task_id: taskId, tag_id: tagId },
      update: {},
    });

    const updatedTask = await getTaskWithRelations(taskId, req.user.id);
    return res.status(200).json({
      message: "Gan tag thanh cong",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Loi addTagToTask:", error);
    return res.status(500).json({ error: "Loi he thong" });
  }
};

export const removeTagFromTask = async (req: any, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const tagId = parseInt(req.params.tagId);

    if (isNaN(taskId) || isNaN(tagId)) {
      return res.status(400).json({ error: "ID task hoac tag khong hop le" });
    }

    const task = await prisma.tasks.findFirst({
      where: { id: taskId, user_id: req.user.id, is_deleted: false },
    });
    if (!task) {
      return res.status(404).json({ error: "Khong tim thay task" });
    }

    await prisma.task_Tags.deleteMany({
      where: { task_id: taskId, tag_id: tagId },
    });

    const updatedTask = await getTaskWithRelations(taskId, req.user.id);
    return res.status(200).json({
      message: "Go tag thanh cong",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Loi removeTagFromTask:", error);
    return res.status(500).json({ error: "Loi he thong" });
  }
};
