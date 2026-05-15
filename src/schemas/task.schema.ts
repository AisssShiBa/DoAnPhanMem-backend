import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    category_id: z.number().int().positive("Invalid Category ID").optional(),
    title: z.string().min(1, "Title is required").max(255),
    description: z.string().optional(),
    start_date: z
      .string()
      .datetime({ message: "Start date must be a valid ISO datetime string" })
      .optional(),
    due_date: z
      .string()
      .datetime({ message: "Due date must be a valid ISO datetime string" })
      .optional(),
    priority: z.number().int().min(1).max(3).optional(),
    status: z.string().max(50).optional(),
    tag_ids: z.array(z.number().int().positive("Invalid Tag ID")).optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    category_id: z.number().int().positive("Invalid Category ID").optional(),
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    start_date: z
      .string()
      .datetime({ message: "Start date must be a valid ISO datetime string" })
      .optional(),
    due_date: z
      .string()
      .datetime({ message: "Due date must be a valid ISO datetime string" })
      .optional(),
    priority: z.number().int().min(1).max(3).optional(),
    status: z.string().max(50).optional(),
    tag_ids: z.array(z.number().int().positive("Invalid Tag ID")).optional(),
  }),
});

export const updateTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(["todo", "in_progress", "done", "cancelled"]),
  }),
});
