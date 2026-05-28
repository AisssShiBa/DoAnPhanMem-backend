import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../config/prisma";

/* ==================================================
   VALIDATION SCHEMAS
================================================== */

const updateProfileSchema = z.object({
  full_name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z.string().nullable().optional(),
  school: z.string().nullable().optional(),
  major: z.string().nullable().optional(),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1, "Thiếu mật khẩu hiện tại"),
  new_password: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
});

const updateSettingsSchema = z.object({
  language: z.enum(["vi", "en"]).optional(),
  timezone: z.string().optional(),
  notification_enabled: z.boolean().optional(),
});

/* ==================================================
   HELPER
================================================== */

const getUserId = (req: Request): number => (req as any).user.id;

/* ==================================================
   GET /profile
   Lấy toàn bộ hồ sơ
================================================== */

export const getFullProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        school: true,
        major: true,
        provider: true,
        status: true,
        created_at: true,
        settings: {
          select: {
            language: true,
            timezone: true,
            notification_enabled: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "Không tìm thấy user" });

    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/* ==================================================
   PUT /profile
   Cập nhật thông tin hồ sơ
================================================== */

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        error: "Dữ liệu không hợp lệ",
        details: parsed.error.issues,
      });

    const { full_name, phone, school, major } = parsed.data;

    await prisma.users.update({
      where: { id: userId },
      data: {
        full_name: full_name.trim(),
        phone: phone?.trim() ?? null,
        school: school?.trim() ?? null,
        major: major?.trim() ?? null,
        updated_at: new Date(),
      },
    });

    return res.status(200).json({ message: "Cập nhật hồ sơ thành công" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/* ==================================================
   PUT /profile/password
   Đổi mật khẩu
================================================== */

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        error: "Dữ liệu không hợp lệ",
        details: parsed.error.issues,
      });

    const { current_password, new_password } = parsed.data;

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user)
      return res.status(404).json({ error: "Không tìm thấy tài khoản" });

    if (user.provider === "google")
      return res
        .status(400)
        .json({ error: "Tài khoản Google không thể đổi mật khẩu tại đây" });

    const isValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isValid)
      return res.status(401).json({ error: "Mật khẩu hiện tại không đúng" });

    const hashed = await bcrypt.hash(new_password, 10);
    await prisma.users.update({
      where: { id: userId },
      data: { password_hash: hashed, updated_at: new Date() },
    });

    return res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/* ==================================================
   PUT /profile/settings
   Cập nhật cài đặt hệ thống
================================================== */

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const parsed = updateSettingsSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        error: "Dữ liệu không hợp lệ",
        details: parsed.error.issues,
      });

    const { language, timezone, notification_enabled } = parsed.data;

    await prisma.user_Settings.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        language: language ?? "vi",
        timezone: timezone ?? "Asia/Ho_Chi_Minh",
        notification_enabled: notification_enabled ?? true,
      },
      update: {
        ...(language !== undefined && { language }),
        ...(timezone !== undefined && { timezone }),
        ...(notification_enabled !== undefined && { notification_enabled }),
      },
    });

    // Khi tắt thông báo, skip toàn bộ reminder đang chờ của user
    if (notification_enabled === false) {
      await prisma.reminders.updateMany({
        where: {
          user_id: userId,
          status: "pending",
        },
        data: { status: "skipped" },
      });
    }

    return res.status(200).json({ message: "Cập nhật cài đặt thành công" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
