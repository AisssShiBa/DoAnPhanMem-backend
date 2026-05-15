import type { Request, Response } from "express";
import prisma from "../config/prisma";
import multer from "multer";
import path from "path";
import fs from "fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// ── Multer storage ────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ── Helper: lấy đường dẫn vật lý từ file_url ─────────────────
// file_url = "http://localhost:3000/uploads/abc.png"
// → "uploads/abc.png"
const getPhysicalPath = (fileUrl: string): string => {
  const fileName = fileUrl.split("/uploads/")[1];
  return fileName ? `uploads/${fileName}` : "";
};

// ── Upload ────────────────────────────────────────────────────
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
      // ✅ Xóa file đã upload nếu task không tồn tại
      files.forEach((f) => {
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });
      return res.status(404).json({ error: "Không tìm thấy task" });
    }

    const attachments = await Promise.all(
      files.map((f) =>
        prisma.task_Attachments.create({
          data: {
            task_id: taskId,
            file_name: Buffer.from(f.originalname, "latin1").toString("utf8"),
            file_url: `${BASE_URL}/uploads/${f.filename}`,
            file_size: f.size,
            mime_type: f.mimetype,
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

// ── Get ───────────────────────────────────────────────────────
export const getAttachments = async (req: any, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);

    // ✅ Kiểm tra task thuộc user trước khi trả về
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

// ── Delete ────────────────────────────────────────────────────
export const deleteAttachment = async (req: any, res: Response) => {
  try {
    const attachmentId = parseInt(req.params.attachmentId);
    const taskId = parseInt(req.params.id);

    // ✅ Kiểm tra attachment thuộc task của user — tránh user xóa file của người khác
    const att = await prisma.task_Attachments.findFirst({
      where: {
        id: attachmentId,
        task_id: taskId,
        task: { user_id: req.user.id, is_deleted: false },
      },
    });
    if (!att) {
      return res.status(404).json({ error: "Không tìm thấy file" });
    }

    // ✅ FIX: đường dẫn vật lý đúng thay vì `.${att.file_url}`
    const filePath = getPhysicalPath(att.file_url);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.task_Attachments.delete({ where: { id: attachmentId } });

    return res.status(200).json({ message: "Xóa file thành công" });
  } catch (error) {
    console.error("Lỗi deleteAttachment:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
