
import unless from 'express-unless'; // Import the express-unless package
import { expressjwt } from "express-jwt";
import jwt from "jsonwebtoken";
// const jwt =require("jsonwebtoken");
import cors from 'cors';


import { validate } from "./validation.middleware.js";
import { z } from "zod"

import express, { Request, Response, NextFunction, Application } from "express";
import { LoginSchema, validateLogin } from './auth.js';
import { createUserController } from './controller/creatUserController.js';
import { loginController } from './controller/login.js';
import router from './routes/routes.js';
export const app: Application = express();


import cookieParser from "cookie-parser";
import { refreshController } from './controller/refreshController.js';
import { logout } from './controller/logout.js';
app.use(cookieParser());
app.use(express.json()); // 支持 JSON 体
// app.use(cors())  在nginx配置
app.post("/api/register", createUserController)
app.post("/api/login", validate(LoginSchema, 'body'), loginController);
app.post("/api/refresh", refreshController);
app.post("/api/auth/logout", logout)
// 2. 挂载你定义的 router（适合模块化业务）
// 所有 todoRouter 里的路径都会自动加上 /api 前缀
app.use('/api', router);

