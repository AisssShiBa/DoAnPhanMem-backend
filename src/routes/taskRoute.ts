import { Router } from "express";
import multer from "multer";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
} from "../controllers/taskController";
import {
  getTrash,
  restoreTask,
  permanentDelete,
  emptyTrash,
  restoreAll,
} from "../controllers/Trashcontroller";
import {
  uploadAttachments,
  getAttachments,
  deleteAttachment,
} from "../controllers/attachmentController";
import { protectedRoute } from "../middlewares/authMiddleware";
import {
  getReminders,
  createReminder,
  deleteReminder,
} from "../controllers/reminderController";
const router = Router();
const upload = multer({ dest: "uploads/" });

// ── Trash — phải đứng TRƯỚC /:id ─────────────────────────────
router.get("/trash", protectedRoute, getTrash);
router.delete("/trash/empty", protectedRoute, emptyTrash);
router.patch("/trash/restore-all", protectedRoute, restoreAll);

// ── Task list ─────────────────────────────────────────────────
router.get("/", protectedRoute, getTasks);
router.post("/", protectedRoute, createTask);

// ── Attachments — phải đứng TRƯỚC /:id ───────────────────────
router.post(
  "/:id/attachments",
  protectedRoute,
  upload.array("files"),
  uploadAttachments,
);
router.get("/:id/attachments", protectedRoute, getAttachments);
router.delete(
  "/:id/attachments/:attachmentId",
  protectedRoute,
  deleteAttachment,
);
router.get("/:taskId/reminders", protectedRoute, getReminders);
router.post("/:taskId/reminders", protectedRoute, createReminder);
router.delete("/:taskId/reminders/:reminderId", protectedRoute, deleteReminder);
// ── Task item ─────────────────────────────────────────────────
router.get("/:id", protectedRoute, getTaskById);
router.patch("/:id", protectedRoute, updateTask);

router.delete("/:id", protectedRoute, deleteTask);

// ── Restore / Permanent delete ────────────────────────────────
router.patch("/:id/restore", protectedRoute, restoreTask);
router.delete("/:id/permanent", protectedRoute, permanentDelete);

export default router;
