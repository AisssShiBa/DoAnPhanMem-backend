import { Router } from "express";
import {
  getDashboardStats,
  getWeeklyPerformance,
  getRecentTasks,
  getCalendarTasks,
  getDashboardFull,
} from "../controllers/dashboardController";
import { protectedRoute } from "../middlewares/authMiddleware";

const router = Router();

router.get("/stats", protectedRoute, getDashboardStats);
router.get("/weekly", protectedRoute, getWeeklyPerformance);
router.get("/recent-tasks", protectedRoute, getRecentTasks);
router.get("/calendar", protectedRoute, getCalendarTasks);
router.get("/", protectedRoute, getDashboardFull);
export default router;
