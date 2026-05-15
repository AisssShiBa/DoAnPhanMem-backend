import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    phone: z.string().max(20).optional(),
    password: z
      .string()
      .min(6, "Password   must be at least 6 characters long"),
    full_name: z.string().min(1, "Full name is required").max(255).optional(),
    role_id: z.number().int().positive("Invalid Role ID").optional(),
    provider: z.string().max(50).optional(),
    status: z.string().max(50).optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    phone: z.string().max(20).optional(),
    full_name: z.string().max(255).optional(),
    status: z.string().max(50).optional(),
    role_id: z.number().int().positive("Invalid Role ID").optional(),
  }),
});

export const updateUserSettingsSchema = z.object({
  body: z.object({
    theme: z.string().max(50).optional(),
    notification_enabled: z.boolean().optional(),
  }),
});
