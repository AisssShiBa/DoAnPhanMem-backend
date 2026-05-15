import { Router } from "express";
import { protectedRoute } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/adminMiddleware";
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getSystemStats,
  getDauChart,
  getMauChart,
  resetUserPassword,
  broadcastNotification,
  getNotificationHistory,
  getDefaultTags,
  createDefaultTag,
  deleteDefaultTag,
  getAuditLogs,
  getUserTaskStats,
  getCategoryStats,
  getInactiveUsers,
} from "../controllers/adminController";
import { getActivityHeatmap } from "../controllers/HeatmapController";

const router = Router();

router.use(protectedRoute, requireAdmin);

// ── Thống kê ──────────────────────────────────────
router.get("/stats", getSystemStats);
router.get("/stats/categories", getCategoryStats);
router.get("/dashboard/dau", getDauChart);
router.get("/dashboard/mau", getMauChart);
router.get("/heatmap", getActivityHeatmap);

// ── Quản lý user ──────────────────────────────────
router.get("/users", getAllUsers);
router.get("/users/inactive", getInactiveUsers);
router.get("/users/:id", getUserById);
router.get("/users/:id/tasks", getUserTaskStats);
router.patch("/users/:id/status", updateUserStatus);
router.post("/users/:id/reset-password", resetUserPassword);
router.delete("/users/:id", deleteUser);

// ── Thông báo broadcast ───────────────────────────
router.post("/notifications/broadcast", broadcastNotification);
router.get("/notifications/history", getNotificationHistory);

// ── Tags mặc định ─────────────────────────────────
router.get("/tags", getDefaultTags);
router.post("/tags", createDefaultTag);
router.delete("/tags/:id", deleteDefaultTag);

// ── Audit log ─────────────────────────────────────
router.get("/logs", getAuditLogs);

export default router;
