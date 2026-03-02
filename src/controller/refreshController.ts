import { expressjwt } from "express-jwt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { Request, Response } from "express";


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
            sameSite: "strict",      // 防 CSRF
            maxAge: 24 * 60 * 60 * 1000 // 1天
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