// type CookieOptions = { [key: string]: string | number | boolean | undefined };
import { CookieOptions } from "express";
import { NextFunction, Response } from "express";

// 核心修改：指定根域名
const COMMON_DOMAIN = ".rainbowgem.dpdns.org";

export const refreshTokenCookieOptions: CookieOptions = {
    httpOnly: true,          // JS 无法读取（防 XSS）
    // secure: process.env.NODE_ENV === "production", // 生产必须 https
    secure: true,
    sameSite: "lax",      // 防 CSRF
    maxAge: 24 * 60 * 60 * 1000,// 1天
    domain: COMMON_DOMAIN, // 允许子域名共享
    path: "/api/refresh"
}

export const csrfTokenCookieOptions: CookieOptions = {
    httpOnly: false,                                  // ⚠️ 必须 false，前端 JS 需要读
    // secure: process.env.NODE_ENV === "production",
    secure: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,           // 与 refreshToken 同寿命
    domain: COMMON_DOMAIN, // 允许子域名共享
    path: "/"

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



/**
 * 清除所有身份验证相关的 Cookies
 * @param {Response} res - Express 的 response 对象
 */
export const setLogoutCookies = (res: Response) => {
    // 1. 清除 Refresh Token (注意 path 必须与设置时一致)
    res.clearCookie("refreshToken", {
        ...refreshTokenCookieOptions,
        maxAge: 0 // 立即过期
    });

    // 2. 清除 Refresh Token 状态标识
    res.clearCookie("refreshTokenIsValid", {
        ...csrfTokenCookieOptions,
        maxAge: 0
    });

    // 3. 清除 CSRF Token
    res.clearCookie("csrfToken", {
        ...csrfTokenCookieOptions,
        maxAge: 0
    });
};