import type { Request, Response } from "express";
import prisma from "../config/prisma";

// Palette màu mặc định khi user không chọn màu
const DEFAULT_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f97316", // orange
  "#14b8a6", // teal
  "#22c55e", // green
  "#eab308", // yellow
  "#ef4444", // red
  "#3b82f6", // blue
  "#06b6d4", // cyan
];

/** Lấy màu mặc định theo thứ tự tạo */
async function getNextDefaultColor(userId: number): Promise<string> {
  const count = await prisma.categories.count({
    where: { user_id: userId, is_deleted: false },
  });
  return DEFAULT_COLORS[count % DEFAULT_COLORS.length]!;
}

// ─── GET /categories ───────────────────────────────────────────
export const getCategories = async (req: any, res: Response) => {
  try {
    const categories = await prisma.categories.findMany({
      where: { user_id: req.user.id, is_deleted: false },
      select: {
        id: true,
        name: true,
        color_code: true, // ✅ trả về màu cho frontend
        display_order: true,
        created_at: true,
        _count: {
          // ✅ trả luôn số task trong mỗi category
          select: {
            tasks: { where: { is_deleted: false } },
          },
        },
      },
      orderBy: { display_order: "asc" },
    });
    return res.status(200).json({ categories });
  } catch (error) {
    console.error("Lỗi getCategories:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

// ─── POST /categories ──────────────────────────────────────────
export const createCategory = async (req: any, res: Response) => {
  try {
    const { name, color_code } = req.body;

    if (!name?.trim()) {
      return res
        .status(400)
        .json({ error: "Tên danh sách không được để trống" });
    }

    // Validate màu hex nếu có
    if (color_code && !/^#[0-9A-Fa-f]{6}$/.test(color_code)) {
      return res
        .status(400)
        .json({ error: "Màu không hợp lệ, cần dạng #RRGGBB" });
    }

    // Kiểm tra tên trùng
    const existing = await prisma.categories.findFirst({
      where: { user_id: req.user.id, name: name.trim(), is_deleted: false },
    });
    if (existing) {
      return res.status(409).json({ error: "Tên danh sách đã tồn tại" });
    }

    // Lấy display_order lớn nhất
    const last = await prisma.categories.findFirst({
      where: { user_id: req.user.id, is_deleted: false },
      orderBy: { display_order: "desc" },
    });

    const resolvedColor =
      color_code ?? (await getNextDefaultColor(req.user.id));

    const category = await prisma.categories.create({
      data: {
        user_id: req.user.id,
        name: name.trim(),
        color_code: resolvedColor,
        display_order: (last?.display_order ?? 0) + 1,
      },
    });

    return res
      .status(201)
      .json({ message: "Tạo danh sách thành công", category });
  } catch (error) {
    console.error("Lỗi createCategory:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

// ─── PUT /categories/:id ───────────────────────────────────────
export const updateCategory = async (req: any, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, color_code, display_order } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID không hợp lệ" });
    }

    if (color_code && !/^#[0-9A-Fa-f]{6}$/.test(color_code)) {
      return res
        .status(400)
        .json({ error: "Màu không hợp lệ, cần dạng #RRGGBB" });
    }

    const existing = await prisma.categories.findFirst({
      where: { id, user_id: req.user.id, is_deleted: false },
    });
    if (!existing) {
      return res.status(404).json({ error: "Không tìm thấy danh sách" });
    }

    // Kiểm tra tên trùng nếu đổi tên
    if (name && name.trim() !== existing.name) {
      const duplicate = await prisma.categories.findFirst({
        where: {
          user_id: req.user.id,
          name: name.trim(),
          is_deleted: false,
          id: { not: id },
        },
      });
      if (duplicate) {
        return res.status(409).json({ error: "Tên danh sách đã tồn tại" });
      }
    }

    const category = await prisma.categories.update({
      where: { id },
      data: {
        name: name?.trim() ?? existing.name,
        color_code: color_code ?? existing.color_code,
        display_order: display_order ?? existing.display_order,
        updated_at: new Date(),
      },
    });

    return res.status(200).json({ message: "Cập nhật thành công", category });
  } catch (error) {
    console.error("Lỗi updateCategory:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

// ─── DELETE /categories/:id ────────────────────────────────────
export const deleteCategory = async (req: any, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { force } = req.query; // ?force=true để xóa kể cả khi có task

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID không hợp lệ" });
    }

    const existing = await prisma.categories.findFirst({
      where: { id, user_id: req.user.id, is_deleted: false },
    });
    if (!existing) {
      return res.status(404).json({ error: "Không tìm thấy danh sách" });
    }

    const taskCount = await prisma.tasks.count({
      where: { category_id: id, is_deleted: false },
    });

    // Nếu có task và không force → warning, không xóa
    if (taskCount > 0 && force !== "true") {
      return res.status(409).json({
        error: "Danh sách có task đang tồn tại",
        taskCount,
        hint: "Thêm ?force=true để xóa bất kể task còn tồn tại",
      });
    }

    await prisma.categories.update({
      where: { id },
      data: { is_deleted: true, updated_at: new Date() },
    });

    return res.status(200).json({
      message: "Xóa danh sách thành công",
      taskCount,
    });
  } catch (error) {
    console.error("Lỗi deleteCategory:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

// ─── PATCH /categories/reorder ────────────────────────────────
// Body: { orders: [{ id: number, display_order: number }] }
export const reorderCategories = async (req: any, res: Response) => {
  try {
    const { orders } = req.body as {
      orders: { id: number; display_order: number }[];
    };

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: "Dữ liệu sắp xếp không hợp lệ" });
    }

    await Promise.all(
      orders.map(({ id, display_order }) =>
        prisma.categories.updateMany({
          where: { id, user_id: req.user.id, is_deleted: false },
          data: { display_order, updated_at: new Date() },
        }),
      ),
    );

    return res.status(200).json({ message: "Sắp xếp thành công" });
  } catch (error) {
    console.error("Lỗi reorderCategories:", error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
