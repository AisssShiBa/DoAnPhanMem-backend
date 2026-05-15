import { z } from "zod";

export const createReminderSchema = z.object({
  body: z.object({
    task_id: z.number().int().positive("Invalid Task ID"),
    remind_time: z
      .string()
      .datetime({ message: "Remind time must be a valid ISO datetime string" }),
    status: z.string().max(50).optional(),
  }),
});

export const updateReminderSchema = z.object({
  body: z.object({
    remind_time: z
      .string()
      .datetime({ message: "Remind time must be a valid ISO datetime string" })
      .optional(),
    status: z.string().max(50).optional(),
  }),
});

export const updateReminderStatusSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "sent", "cancelled"]),
  }),
});
