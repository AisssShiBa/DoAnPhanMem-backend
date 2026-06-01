import { Router } from "express";
import { getTags, createTag, deleteTag } from "../controllers/tagController";
import { protectedRoute } from "../middlewares/authMiddleware";
const router = Router();

router.get("/", protectedRoute, getTags);
router.post("/", protectedRoute, createTag);
router.delete("/:id", protectedRoute, deleteTag);
export default router;
