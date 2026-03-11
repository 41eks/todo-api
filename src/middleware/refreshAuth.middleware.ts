import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const refreshSecretKey = process.env.REFRESH_SECRET!;

// 定义校验规则
const RefreshHeaderSchema = z.object({
    // 当 header 中没有 x-csrf-token 时，会触发 invalid_type_error
    'x-csrf-token': z.string().min(1, "X-CSRF-TOKEN header cannot be empty"),
});
// const RefreshHeaderSchema = z.object({
//     'x-csrf-token': z.string({ required_error: "Missing X-CSRF-TOKEN header" }),
// });
import { getRedisClient } from '@/db/redisClient';
export const validateRefreshRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {
        // 2. 校验请求头中是否有 X-CSRF-TOKEN
        // 注意：Express 会自动将 header key 转为小写
        RefreshHeaderSchema.parse(req.headers);
        const csrfTokenFromHeader = req.headers['x-csrf-token'];
        // const csrfTokenFromCookie = req.cookies.csrfToken;

        // 3. 校验 CSRF Token 是否一致 (双重 Cookie 校验模式)
        // if (!csrfTokenFromCookie || csrfTokenFromHeader !== csrfTokenFromCookie) {
        //     return res.status(403).json({ message: "CSRF token mismatch or missing" });
        // }

        // 4. 校验 Cookie 中是否有 refreshToken
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token in cookies" });
        }

        // 5. 验证 refreshToken (JWT 验证)
        // 如果验证失败，jwt.verify 会抛出异常进入 catch
        const decoded = jwt.verify(refreshToken, refreshSecretKey) as { userId: string };

        // 6. 将用户信息挂载到请求对象，方便 controller 使用
        req.user = { id: Number(decoded.userId) };


        //todo
        const client = await getRedisClient();
        const redisKey = `csrf:${req.user.id}`;

        // 从 Redis 中获取存储的 Token
        const csrfTokenInDB = await client.get(redisKey);

        // 1. 检查 Redis 中是否存在该用户的 Token (防止 Token 已过期或用户已注销)
        if (!csrfTokenInDB) {
            return res.status(401).json({
                status: 401,
                message: "Session expired, please login again"
            });
        }

        // 2. 强一致性校验：Header 中的 Token 必须等于 Redis 中的 Token
        if (csrfTokenFromHeader !== csrfTokenInDB) {
            return res.status(403).json({
                status: 403,
                message: "Invalid CSRF token session"
            });
        }

        // 校验通过，进入下一个中间件或 Controller
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.issues[0]?.message });
        }
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
};