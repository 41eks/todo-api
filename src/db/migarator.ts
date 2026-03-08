

import * as schema from '@/db/schema.js'; // 假设 schema.ts 在同级目录

import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
// import { Pool } from "pg";
import Database from 'better-sqlite3';
// 1. 初始化 SQLite 数据库连接
// 'sqlite.db' 是数据库文件的名称
const sqlite = new Database('sqlite.db');

// 2. 初始化 Drizzle
export const db = drizzle(sqlite, { schema });



// const db = drizzle(pool);

async function main() {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migration completed");
    process.exit(0);
}

main();