


import { eq, and } from 'drizzle-orm';
import { db } from '@/db/index.js'; // 你的数据库实例
import { todos } from '@/db/schema.js';

// 1. 创建 ToDo (Create)
export async function createTodo(userId: number, taskname: string, priority: number = 1) {
  const newTodo = await db.insert(todos).values({
    taskname,
    priority,
    userId, // 关联用户
    status: 0, // 默认未完成
  }).returning();
  
  return newTodo[0];
}

// 2. 获取用户的 ToDo 列表 (Read)
export async function getUserTodos(userId: number) {
  return await db.select().from(todos).where(eq(todos.userId, userId));
}

// 3. 更新 ToDo (Update) - 例如修改状态或任务名
export async function updateTodo(
  todoId: number, 
  userId: number, 
  data: { taskname?: string; priority?: number; status?: number }
) {
  const updatedTodo = await db
    .update(todos)
    .set({
      ...data,
      updatedAt: new Date(), // 更新时间
    })
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId))) // 确保只能操作自己的 todo
    .returning();
    
  return updatedTodo[0];
}

// 4. 删除 ToDo (Delete)
export async function deleteTodo(todoId: number, userId: number) {
  const deletedTodo = await db
    .delete(todos)
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId))) // 确保只能删除自己的 todo
    .returning();
    
  return deletedTodo[0];
}