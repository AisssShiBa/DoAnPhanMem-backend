import type { Request, Response, NextFunction } from "express";

// ✅ Middleware phân quyền — chỉ ADMIN mới được vào
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = (req as any).user;

  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ message: "Chỉ ADMIN mới có quyền truy cập" });
  }

  next();
};
