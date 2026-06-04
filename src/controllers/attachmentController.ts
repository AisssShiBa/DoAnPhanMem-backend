import type { Response } from "express";
import prisma from "../config/prisma";
import multer from "multer";
import path from "path";
import fs from "fs";
import { deleteLocalUploadByUrl } from "../utils/localFileStorage";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadAttachments = async (req: any, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "Không có file nào được gửi" });
    }

    const task = await prisma.tasks.findFirst({
      where: { id: taskId, user_id: req.user.id, is_deleted: false },
    });

    if (!task) {
      files.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
      return res.status(404).json({ error: "Không tìm thấy task" });
    }

    const attachments = await Promise.all(
      files.map((file) =>
        prisma.task_Attachments.create({
          data: {
            task_id: taskId,
            file_name: Buffer.from(file.originalname, "latin1").toString(
              "utf8",
            ),
            file_url: `${BASE_URL}/uploads/${file.filename}`,
            file_size: file.size,
            mime_type: file.mimetype,
          },
        }),
      ),
    );

    return res.status(201).json({ attachments });
  } catch (error) {
    console.error("Lỗi uploadAttachments:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const getAttachments = async (req: any, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);

    const task = await prisma.tasks.findFirst({
      where: { id: taskId, user_id: req.user.id, is_deleted: false },
    });
    if (!task) {
      return res.status(404).json({ error: "Không tìm thấy task" });
    }

    const attachments = await prisma.task_Attachments.findMany({
      where: { task_id: taskId },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({ attachments });
  } catch (error) {
    console.error("Lỗi getAttachments:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const deleteAttachment = async (req: any, res: Response) => {
  try {
    const attachmentId = parseInt(req.params.attachmentId);
    const taskId = parseInt(req.params.id);

    const attachment = await prisma.task_Attachments.findFirst({
      where: {
        id: attachmentId,
        task_id: taskId,
        task: { user_id: req.user.id, is_deleted: false },
      },
    });
    if (!attachment) {
      return res.status(404).json({ error: "Không tìm thấy file" });
    }

    deleteLocalUploadByUrl(attachment.file_url);
    await prisma.task_Attachments.delete({ where: { id: attachmentId } });

    return res.status(200).json({ message: "Xóa file thành công" });
  } catch (error) {
    console.error("Lỗi deleteAttachment:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
