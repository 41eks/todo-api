

// // 定义一个 Zod schema 来校验精确匹配的用户名和密码
// export const LoginSchema = z.object({
//   username: z.literal('admin', {
//     errorMap: (issue, ctx) => {
//       if (issue.code ==="invalid_literal") {
//         return { message: '用户名错误' };
//       }
//       return { message: ctx.defaultError };
//     },
//   }),
//   password: z.literal('password123', {
//     errorMap: (issue, ctx) => {
//       if (issue.code === "invalid_literal") {
//         return { message: '密码错误' };
//       }
//       return { message: ctx.defaultError };
//     },
//   }),
// });

// import { z } from 'zod';

// // Define a Zod schema to validate exact matching username and password
// export const LoginSchema = z.object({
//   username: z.string().refine(val => val === 'admin', {
//     message: '用户名错误'
//   }),
//   password: z.string().refine(val => val === 'password123', {
//     message: '密码错误'
//   }),
// });

// Alternative approach using transform for more complex validation



// const userMap: Record<string, string> = {
//   Alex: '834159672wasp',
// }

// export const LoginSchema = z.object({
//   username: z.string(),
//   password: z.string()
// }).refine(data => {
//   return userMap[data.username] === data.password
// }, {
//   message: '用户名或密码错误',
//   path: ['username']
// })

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from './db/index.js'; // 导入上面创建的 db 实例
import { users } from './db/schema.js';
import bcrypt from 'bcryptjs';

export const LoginSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(1, "密码不能为空")
});

// 将校验逻辑从 Zod 的 refine 移出，因为数据库查询是异步的，
// 建议在 Controller 中进行异步校验。
import { findUserByName } from './service/user.js';
export async function validateLogin(data: z.infer<typeof LoginSchema>) {
  // 1. 从数据库查找用户
  const user = await findUserByName(data.username);

  if (!user) {
    return { success: false, message: '用户不存在' };
  }

  // 2. 使用 bcrypt 对比密码
  // const isPasswordValid = await bcrypt.compare(data.password, user.password);
  
  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    return { success: false, message: '密码错误' };
  }

  return { success: true, userId: user.id };
}