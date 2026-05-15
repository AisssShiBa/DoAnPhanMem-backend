import { Router } from "express";
import {
  getSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
} from "../controllers/subtaskController";
import { protectedRoute } from "../middlewares/authMiddleware";

const router = Router();

router.get("/:taskId/subtasks", protectedRoute, getSubtasks);
router.post("/:taskId/subtasks", protectedRoute, createSubtask);
router.patch("/:taskId/subtasks/:subtaskId", protectedRoute, updateSubtask);
router.delete("/:taskId/subtasks/:subtaskId", protectedRoute, deleteSubtask);

export default router;
