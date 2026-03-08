import * as todoService from '@/service/todoService.js'; // 导入之前的 CRUD 函数
import { createTodoController } from './todoControllerFactory.js';

import { createUserIdController } from './userIdControllerFactory.js';
import * as userService from '@/service/user.js';

// 生成具体的 Controller
export const todoController = createTodoController(todoService);


export const userController = createUserIdController({ getUserProfile: userService.findUserById });

