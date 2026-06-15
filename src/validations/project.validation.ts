import { z } from "zod";

export const createProjectSchema = z.object({
    name: z.string().min(3).max(100),
    description: z.string().optional(),
    createdById: z.string().uuid("Invalid user ID format"),
});

export const updateProjectSchema = createProjectSchema.omit({ createdById: true }).extend({
    actorId: z.string().uuid("Actor ID is required for auditing"),
});

export const deleteProjectSchema = z.object({
    actorId: z.string().uuid("Actor ID is required for auditing"),
});