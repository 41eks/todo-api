import { expressjwt } from "express-jwt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { Request, Response } from "express";
import crypto from "crypto";
import { ref } from "process";
import { refreshTokenCookieOptions, csrfTokenCookieOptions, setAuthCookies } from "./cookieSetting.js";
const refreshSecretKey = process.env.REFRESH_SECRET!;
const accessSecretKey = process.env.ACCESS_SECRET!;
import { getRedisClient } from "@/db/redisClient.js";
export async function refreshController(req: Request, res: Response) {
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
        const csrfToken = setAuthCookies(res, newRefreshToken);

        
        const client = await getRedisClient();
        /**
         * 这里的 Key 设计建议：csrf:{userId}
         * 过期时间应与 Refresh Token 一致（例如 1 天 = 86400 秒）
         */
        const redisKey = `csrf:${payload.userId}`;
        await client.set(redisKey, csrfToken, {
            EX: 60 * 60 * 24 // 24小时过期
        });


        return res.json({
            status: 200,
            accessToken: newAccessToken,
            // refreshToken: newRefreshToken,
            message: "success"
        });

    } catch (err) {
        // 如果 JWT 验证失败（过期或伪造）
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ message: "invalid or expired refresh token" });
        }
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