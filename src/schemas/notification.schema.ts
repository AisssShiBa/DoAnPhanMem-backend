import { z } from "zod";

export const createNotificationSchema = z.object({
  body: z.object({
    user_id: z.number().int().positive("Invalid User ID"),
    title: z.string().max(255).optional(),
    content: z.string().optional(),
    type: z.string().max(50).optional(),
  }),
});

export const markNotificationReadSchema = z.object({
  body: z.object({
    is_read: z.boolean(),
  }),
});
