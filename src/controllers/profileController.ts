import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../config/prisma";

const updateProfileSchema = z.object({
  full_name: z.string().min(2, "Ho ten phai co it nhat 2 ky tu"),
  phone: z.string().nullable().optional(),
  school: z.string().nullable().optional(),
  major: z.string().nullable().optional(),
});

const changePasswordSchema = z.object({
  current_password: z.string().optional(),
  new_password: z.string().min(8, "Mat khau moi phai co it nhat 8 ky tu"),
});

const updateSettingsSchema = z.object({
  language: z.enum(["vi", "en"]).optional(),
  timezone: z.string().optional(),
  notification_enabled: z.boolean().optional(),
});

const getUserId = (req: Request): number => (req as any).user.id;

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
        password_hash: true,
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

    if (!user) {
      return res.status(404).json({ error: "Khong tim thay user" });
    }

    const { password_hash, ...safeUser } = user;
    return res.status(200).json({
      user: {
        ...safeUser,
        has_password: Boolean(password_hash),
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Loi he thong" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Du lieu khong hop le",
        details: parsed.error.issues,
      });
    }

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

    return res.status(200).json({ message: "Cap nhat ho so thanh cong" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Loi he thong" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Du lieu khong hop le",
        details: parsed.error.issues,
      });
    }

    const { current_password, new_password } = parsed.data;

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "Khong tim thay tai khoan" });
    }

    const hasPassword = Boolean(user.password_hash);
    if (hasPassword) {
      if (!current_password) {
        return res.status(400).json({ error: "Thieu mat khau hien tai" });
      }

      const isValid = await bcrypt.compare(
        current_password,
        user.password_hash,
      );
      if (!isValid) {
        return res
          .status(401)
          .json({ error: "Mat khau hien tai khong dung" });
      }
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await prisma.users.update({
      where: { id: userId },
      data: { password_hash: hashed, updated_at: new Date() },
    });

    return res.status(200).json({
      message: hasPassword
        ? "Doi mat khau thanh cong"
        : "Tao mat khau thanh cong",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Loi he thong" });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const parsed = updateSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Du lieu khong hop le",
        details: parsed.error.issues,
      });
    }

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

    if (notification_enabled === false) {
      await prisma.reminders.updateMany({
        where: {
          user_id: userId,
          status: "pending",
        },
        data: { status: "skipped" },
      });
    }

    return res.status(200).json({ message: "Cap nhat cai dat thanh cong" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Loi he thong" });
  }
};
