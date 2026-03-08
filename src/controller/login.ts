import { Request, Response, NextFunction } from 'express';
import { LoginSchema } from '@/auth.js';
import { validateLogin } from '@/auth.js';
import unless from 'express-unless'; // Import the express-unless package
import { expressjwt } from "express-jwt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { refreshTokenCookieOptions, csrfTokenCookieOptions, setAuthCookies } from './cookieSetting.js';
const accessSecretKey = process.env.ACCESS_SECRET!;
const refreshSecretKey = process.env.REFRESH_SECRET!;

export async function loginController(req: Request, res: Response) {
    try {
        // 1. Zod 校验
        const parsed = LoginSchema.parse(req.body);

        // 2. 业务验证（数据库 + bcrypt）
        const result = await validateLogin(parsed);

        if (!result.success) {
            return res.status(400).json({
                status: 400,
                message: result.message
            });
        }

        // ✅ 1️⃣ accessToken（1小时）
        const accessToken = jwt.sign(
            { userId: result.userId },
            accessSecretKey,
            { expiresIn: "5m" }
        );

        // ✅ 2️⃣ refreshToken（1天）
        const refreshToken = jwt.sign(
            { userId: result.userId },
            refreshSecretKey,
            { expiresIn: "1d" }
        );

        const csrfToken = setAuthCookies(res, refreshToken);
        return res.json({
            status: 200,
            message: "login success",
            accessToken
        });

    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({
                status: 400,
                message: err.issues[0]?.message
            });
        }

        return res.status(500).json({
            status: 500,
            message: "服务器错误"
        });
    }
}

