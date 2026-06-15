import { z } from "zod";

export const createUserSchema = z.object({
    username: z.string().min(3).max(50),
    fullName: z.string().min(3).max(100),
});

export const updateUserSchema = createUserSchema;