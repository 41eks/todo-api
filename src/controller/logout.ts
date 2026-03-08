import { setLogoutCookies } from './cookieSetting.js';
import { Request, Response } from 'express';
import { z } from 'zod';
export function logout(req: Request, res: Response) {
    try {

        // ✅ 3️⃣ 写入 cookie（httpOnly）
        // res.cookie("refreshToken", "", {
        //     httpOnly: true,          // JS 无法读取（防 XSS）
        //     secure: process.env.NODE_ENV === "production", // 生产必须 https
        //     sameSite: "strict",      // 防 CSRF
        //     maxAge: 24 * 60 * 60 * 1000 // 1天
        // });
        setLogoutCookies(res);
        return res.json({
            status: 200,
            message: "logout success",
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