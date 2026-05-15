import { z } from "zod";

export const createSubTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(255),
    status: z.string().max(50).optional(),
  }),
});

export const updateSubTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    status: z.string().max(50).optional(),
  }),
});

export const updateSubTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(["todo", "in_progress", "done"]),
  }),
});
