
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 用户表
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(), // 用户名唯一
  password: text('password').notNull(),         // 实际生产环境请存储哈希值
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Todo 事项表
export const todos = sqliteTable('todos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskname: text('taskname').notNull(),
  priority: integer('priority').default(1), // 优先级: 1低, 2中, 3高
  status: integer('status').default(0),    // 状态: 0未完成, 1已完成
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),           // 外键关联
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});