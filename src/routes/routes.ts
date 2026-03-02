import { Router } from 'express';

import { todoController } from '@/controller/todo.js';
// 假设你有一个 auth 中间件来验证 token 并填充 req.user
import { authMiddleware } from '@/middleware/auth.middleware.js';

const router:Router = Router();

// 应用中间件保护路由
router.use(authMiddleware);

router.post('/todos', todoController.create);
router.get('/todos', todoController.getAll);
router.put('/todos/:id', todoController.update);
router.delete('/todos/:id', todoController.delete);

export default router;