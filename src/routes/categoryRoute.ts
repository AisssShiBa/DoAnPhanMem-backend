import { Router } from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import { protectedRoute } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", protectedRoute, getCategories);
router.post("/", protectedRoute, createCategory);
router.patch("/:id", protectedRoute, updateCategory);
router.delete("/:id", protectedRoute, deleteCategory);

export default router;
