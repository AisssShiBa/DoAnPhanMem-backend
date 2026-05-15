// src/routes/notificationRoute.ts
import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController";
import { protectedRoute } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", protectedRoute, getNotifications);
router.patch("/read-all", protectedRoute, markAllAsRead);
router.patch("/:id/read", protectedRoute, markAsRead);

export default router;
