import { Router } from "express";
import { protectedRoute } from "../middlewares/authMiddleware"; // ← thêm import
import {
  signup,
  verifyEmail,
  signin,
  googleAuth,
  googleCallback,
  getProfile,
  forgotPassword,
  resetPassword,
  logout,
  refresh,
  logoutAll,
  getSessions,
  revokeSession,
} from "../controllers/authController";

const router = Router();

// Public routes
router.post("/signup", signup);
router.get("/verify-email", verifyEmail);
router.post("/signin", signin);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/profile", protectedRoute, getProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.post("/refresh", refresh);

router.post("/logout-all", protectedRoute, logoutAll);
router.get("/sessions", protectedRoute, getSessions);
router.delete("/sessions/:id", protectedRoute, revokeSession);

export default router;
