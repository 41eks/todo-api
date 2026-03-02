




import * as schema from '@/db/schema.js'; // 假设 schema.ts 在同级目录

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
// 1. 初始化 SQLite 数据库连接
// 'sqlite.db' 是数据库文件的名称
const sqlite = new Database('sqlite.db');

// 2. 初始化 Drizzle
export const db = drizzle(sqlite, { schema });

// 3. 关闭数据库连接
export function closeDB() {
  sqlite.close();
  console.log('数据库连接已关闭');
}