import { z } from 'zod';

export const CreateUserSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(6),
});