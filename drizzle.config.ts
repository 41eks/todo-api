// import 'dotenv/config';
// import { defineConfig } from 'drizzle-kit';

// export default defineConfig({
//   out: './drizzle',
//   schema: './src/db/schema/index.ts',
//   dialect: 'mysql',
//   dbCredentials: {
//     url: process.env.DATABASE_URL!,
//   },
// });


// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // 1. 指定数据库类型
  dialect:  'sqlite',
  
  // 2. 指向你将要定义表的文件
  schema: './src/db/schema.ts',
  
  // 3. 迁移文件输出目录（当使用 generate 命令时）
  out: './drizzle',
  
  // 4. 数据库连接信息（从环境变量读取更安全）
  dbCredentials: {
    url:  './sqlite.db',
  },
  // 如果你不想使用环境变量，也可以直接写（不推荐）：
  // dbCredentials: {
  //   host: 'localhost',
  //   port: 5432,
  //   user: 'postgres',
  //   password: 'password',
  //   database: 'mydb',
  // },
});