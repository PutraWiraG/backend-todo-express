import { z } from "zod";

const taskBaseSchema = z.object({
    title: z.string().min(3).max(255),
    description: z.string().optional().nullable(),
    status: z.enum(["TO_DO", "IN_PROGRESS", "DONE"]).optional().nullable(),
    projectId: z.string().uuid("Invalid project ID format"),
    createdById: z.string().uuid("Invalid creator ID format"),
    parentId: z.string().uuid().optional().nullable(),
    actorId: z.string().uuid("Invalid actor ID format").optional(),
});

export const createTaskSchema: any = taskBaseSchema.extend({
    children: z.lazy(() => createTaskSchema.array()).optional(),
});

export const updateTaskSchema: any = taskBaseSchema.partial().omit({
    projectId: true,
    createdById: true,
}).extend({
    actorId: z.string().uuid("Actor ID is required for auditing"),
    children: z.lazy(() => updateTaskSchema.array()).optional(),
});

export const updateTaskStatusSchema = z.object({
    status: z.enum(["TO_DO", "IN_PROGRESS", "DONE"]),
    actorId: z.string().uuid("Actor ID is required for auditing"),
});

export const deleteTaskSchema = z.object({
    actorId: z.string().uuid("Actor ID is required for auditing"),
});