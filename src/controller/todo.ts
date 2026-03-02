import * as todoService from '@/service/todoService.js'; // 导入之前的 CRUD 函数
import { createTodoController } from './controllerFactory.js';

// 生成具体的 Controller
export const todoController = createTodoController(todoService);