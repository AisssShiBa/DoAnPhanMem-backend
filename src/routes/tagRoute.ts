import { Router } from "express";
import { getTags, createTag, deleteTag } from "../controllers/tagController";
import { protectedRoute } from "../middlewares/authMiddleware";
import { addTagToTask, removeTagFromTask } from "../controllers/tagController";
const router = Router();

router.get("/", protectedRoute, getTags);
router.post("/", protectedRoute, createTag);
router.delete("/:id", protectedRoute, deleteTag);
router.post("/:taskId/tags/:tagId", protectedRoute, addTagToTask);
router.delete("/:taskId/tags/:tagId", protectedRoute, removeTagFromTask);
export default router;
