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

export const validateRefreshRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // 1. 跳过 OPTIONS 预检请求
    if (req.method === 'OPTIONS') return next();

    try {
        // 2. 校验请求头中是否有 X-CSRF-TOKEN
        // 注意：Express 会自动将 header key 转为小写
        RefreshHeaderSchema.parse(req.headers);
        const csrfTokenFromHeader = req.headers['x-csrf-token'];
        const csrfTokenFromCookie = req.cookies.csrfToken;

        // 3. 校验 CSRF Token 是否一致 (双重 Cookie 校验模式)
        if (!csrfTokenFromCookie || csrfTokenFromHeader !== csrfTokenFromCookie) {
            return res.status(403).json({ message: "CSRF token mismatch or missing" });
        }

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

        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.issues[0]?.message });
        }
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
};