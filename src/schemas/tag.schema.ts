import { z } from "zod";

export const createTagSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Tag name is required").max(100),
    color_code: z.string().max(10).optional(),
  }),
});

export const updateTagSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    color_code: z.string().max(10).optional(),
  }),
});
