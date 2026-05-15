import { Router } from "express";
import {
  changePassword,
  getFullProfile,
  updateProfile,
  updateSettings,
} from "../controllers/profileController";
import { protectedRoute } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", protectedRoute, getFullProfile); // ← thêm protectedRoute
router.put("/", protectedRoute, updateProfile); // ← thêm protectedRoute
router.put("/settings", protectedRoute, updateSettings); // ← thêm protectedRoute
router.put("/password", protectedRoute, changePassword);

export default router;
