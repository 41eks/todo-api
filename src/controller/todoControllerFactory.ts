
import { Request, Response, NextFunction } from 'express';

// 定义 Service 函数的接口，匹配之前的设计
interface TodoService {
    createTodo: (userId: number, taskname: string, priority?: number) => Promise<any>;
    getUserTodos: (userId: number) => Promise<any[]>;
    updateTodo: (todoId: number, userId: number, data: any) => Promise<any>;
    deleteTodo: (todoId: number, userId: number) => Promise<any>;
}

export const createTodoController = (service: TodoService) => {
    return {
        // 处理创建
        create: async (req: Request, res: Response, next: NextFunction) => {
            try {
                // 假设通过中间件已将 userId 放入 req.user
                const userId = (req as any).user.id;
                const { taskname, priority } = req.body;
                const todo = await service.createTodo(userId, taskname, priority);
                res.status(201).json(todo);
            } catch (error) {
                next(error);
            }
        },

        // 处理获取列表
        getAll: async (req: Request, res: Response, next: NextFunction) => {
            try {
                const userId = (req as any).user.id;
                const todos = await service.getUserTodos(userId);
                res.json(todos);
            } catch (error) {
                next(error);
            }
        },

        // 处理更新
        update: async (req: Request, res: Response, next: NextFunction) => {
            try {
                const userId = (req as any).user.id;
                //@ts-ignore
                const todoId = parseInt(req.params.id);
                const updateData = req.body;
                const updatedTodo = await service.updateTodo(todoId, userId, updateData);

                if (!updatedTodo) {
                    return res.status(404).json({ message: 'Todo not found or unauthorized' });
                }
                res.json(updatedTodo);
            } catch (error) {
                next(error);
            }
        },

        // 处理删除
        delete: async (req: Request, res: Response, next: NextFunction) => {
            try {
                const userId = (req as any).user.id;
                //@ts-ignore
                const todoId = parseInt(req.params.id);
                const deletedTodo = await service.deleteTodo(todoId, userId);

                if (!deletedTodo) {
                    return res.status(404).json({ message: 'Todo not found or unauthorized' });
                }
                res.status(204).send();
            } catch (error) {
                next(error);
            }
        },
    };
};