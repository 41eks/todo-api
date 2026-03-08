
import { Request, Response, NextFunction } from 'express';

// 定义 Service 函数的接口，匹配之前的设计
interface userService {
    // createTodo: (userId: number, taskname: string, priority?: number) => Promise<any>;
    // getUserTodos: (userId: number) => Promise<any[]>;
    // updateTodo: (todoId: number, userId: number, data: any) => Promise<any>;
    // deleteTodo: (todoId: number, userId: number) => Promise<any>;
    getUserProfile: (userId: number) => Promise<any>;
}

export const createUserIdController = (service: userService) => {
    return {
        // 处理获取列表
        getUserProfile: async (req: Request, res: Response, next: NextFunction) => {
            try {
                const userId = (req as any).user.id;
                const todos = await service.getUserProfile(userId);
                res.json(todos);
            } catch (error) {
                next(error);
            }
        },

    };
};