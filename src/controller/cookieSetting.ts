// type CookieOptions = { [key: string]: string | number | boolean | undefined };
import { CookieOptions } from "express";
import { NextFunction, Response } from "express";

export const refreshTokenCookieOptions: CookieOptions = {
    httpOnly: true,          // JS 无法读取（防 XSS）
    secure: process.env.NODE_ENV === "production", // 生产必须 https
    sameSite: "none",      // 防 CSRF
    maxAge: 24 * 60 * 60 * 1000 // 1天
}

export const csrfTokenCookieOptions: CookieOptions = {
    httpOnly: false,                                  // ⚠️ 必须 false，前端 JS 需要读
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000                      // 与 refreshToken 同寿命
}

// 1. 配置选项（建议根据环境动态调整）
const isProduction = process.env.NODE_ENV === "production";

const commonOptions = {
    path: "/",
    secure: isProduction, // 生产环境必须开启 HTTPS
    sameSite: "Lax",      // 防止 CSRF 的标准做法
};


// utils/auth.js
import crypto from "crypto";

/**
 * 统一设置身份验证相关的 Cookies
 * @param {Response} res - Express 的 response 对象
 * @param {string} refreshToken - 生成的刷新令牌
 */
export const setAuthCookies = (res: Response, refreshToken: string) => {


    // 2. 生成 CSRF Token
    const csrfToken = crypto.randomBytes(32).toString("hex");

    // 3. 执行写入
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
    res.cookie("refreshTokenIsValid", "true", csrfTokenCookieOptions);
    res.cookie("csrfToken", csrfToken, csrfTokenCookieOptions);

    return csrfToken; // 返回给调用者，以便在登录响应体中可能需要返回
};