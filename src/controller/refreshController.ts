import { expressjwt } from "express-jwt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { Request, Response } from "express";
import crypto from "crypto";

const refreshSecretKey = process.env.REFRESH_SECRET!;
const accessSecretKey = process.env.ACCESS_SECRET!;
export function refreshController(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "no refresh token" });
    }

    try {
        const payload = jwt.verify(refreshToken, refreshSecretKey) as { userId: string };

        const newAccessToken = jwt.sign(
            { userId: payload.userId },
            accessSecretKey,
            { expiresIn: "5m" }
        );
        // ✅ 2️⃣ refreshToken（1天）
        const newRefreshToken = jwt.sign(
            { userId: payload.userId },
            refreshSecretKey,
            { expiresIn: "1d" }
        );
        // ✅ 3️⃣ 写入 cookie（httpOnly）
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,          // JS 无法读取（防 XSS）
            secure: process.env.NODE_ENV === "production", // 生产必须 https
            sameSite: "none", //前后端跨域     // 防 CSRF
            maxAge: 24 * 60 * 60 * 1000, // 1天,
            path: "/api/refresh"              // ✅ 浏览器只在请求该路径时才携带此 cookie
        });

        // ✅ 生成 CSRF token（随机 32 字节）
        const csrfToken = crypto.randomBytes(32).toString("hex");
        // csrfToken —— 故意不设 httpOnly，让 JS 能读取后放进请求头
        res.cookie("csrfToken", csrfToken, {
            httpOnly: false,                                  // ⚠️ 必须 false，前端 JS 需要读
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000                      // 与 refreshToken 同寿命
        });

        return res.json({
            status: 200,
            accessToken: newAccessToken,
            // refreshToken: newRefreshToken,
            message: "success"
        });

    } catch (err) {
        // return res.status(403).json({ message: "invalid refresh token" });
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