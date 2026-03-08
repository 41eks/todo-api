// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JwtPayloadSchema = z.object({
    userId: z.number(),
    iat: z.number(),
    exp: z.number(),
});
const AuthHeaderSchema = z.object({
    authorization: z
        .string()
        .regex(/^Bearer\s.+$/, 'Invalid Authorization format'),
});

const accessSecretKey = process.env.ACCESS_SECRET!;// 辅助函数：如果是 undefined 则报错
function required<T>(val: T | undefined, message: string): T {
    if (val === undefined) throw new Error(message);
    return val;
}
export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
        // 1️⃣ 校验 header 结构
        console.log(req.headers.authorization);
        const { authorization } = AuthHeaderSchema.parse({
            authorization: req.headers.authorization,
        });

        // 2️⃣ 取出 token
        const token = authorization.split(' ')[1];

        // 3️⃣ 验证 JWT
        // const decoded = jwt.verify(
        //     token,
        //     secretKey
        // ) as { sub: number };

        // // 4️⃣ 挂到 request
        // req.userId = decoded.sub;
        const decoded = jwt.verify(required(token, "login Token为undefine"), accessSecretKey);
        console.log("decode", decoded);
        // const payload = JwtPayloadSchema.parse(decoded);
        // console.log("payload", payload);
        const result = JwtPayloadSchema.safeParse(decoded);

        if (!result.success) {
            console.error("验证失败的详细原因:", result.error.format());
            // 这里可以抛出自定义的未授权异常
            throw new Error("Token 数据格式非法");
        }

        const payload = result.data; // 这里就是类型安全的数据了

        req.user = { id: Number(payload.userId) };

        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized',
        });
    }
};