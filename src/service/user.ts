

import { db } from '@/db/index.js'; // 假设 schema.ts 在同级目录

import { users } from '@/db/schema.js';
import bcrypt from 'bcryptjs';
// 2. 定义添加用户的函数
export async function createUser(username: string, password: string) {
    const passwordhash = await bcrypt.hash(password, 10);
    // 注意：实际项目中请使用 bcrypt 对密码进行哈希处理
    const newUser = await db.insert(users).values({
        username: username,
        password: passwordhash, // 这里仅作示例，千万不要直接存储明文密码！
    }).returning();

    console.log('User created:', newUser);
    return newUser;
}

// 3. 执行示例
// createUser('testuser', 'plain_text_password_123');

import { eq } from 'drizzle-orm';
// import bcrypt from 'bcrypt'; // 实际生产环境需要引入

// 1. 定义查找用户的函数
export async function findUserByName(username: string) {
    // 1. 根据用户名查找用户
    const user = await db.select().from(users).where(eq(users.username, username)).get();
    // const user = result[0];

    if (!user) {
        console.log('用户不存在');
        return null;
    }
    // 返回用户信息（通常不返回密码）
    return { id: user.id, username: user.username, password: user.password };
}

// 示例用法:
// findUserForLogin('testuser', 'plain_text_password_123');