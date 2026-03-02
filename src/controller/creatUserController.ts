import { CreateUserSchema } from "@/schema/user.js";
import { createUser } from "@/service/user.js";
import { Request, Response } from 'express';
import { z } from 'zod';
export const createUserController = async (req: Request, res: Response) => {
    try {
        const { username, password } = CreateUserSchema.parse(req.body);

        const user = await createUser(username, password);

        return res.status(201).json({
            message: 'User created successfully',
            data: user
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: error.issues[0]?.message
            });
        }

        console.error(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};