
// validation.middleware.js
import { ZodError } from 'zod';
import { Request, Response, NextFunction } from "express";
import { z, ZodObject } from 'zod'
type ValidateSource = 'body' | 'query' | 'params';

export const validate = (schema: ZodObject<any>, source: ValidateSource = 'body') => (req: Request, res: Response, next: NextFunction) => {
  try {
    // 尝试解析请求体/查询参数/路径参数
    // 如果验证失败，ZodError 会被抛出
    // Explicitly cast req[source] to any to avoid TypeScript indexing issues
    const parsed = schema.parse(req[source]);
    (req as any)[source] = parsed;
    next();

  } catch (error) {
    // 捕获 ZodError
    if (error instanceof ZodError) {
      // 格式化错误信息
      const formattedErrors = error.issues.map(issue => ({
        field: issue.path.join('.'), // 错误发生的字段路径
        message: issue.message, // 错误信息
      }));

      // 返回 400 Bad Request 状态码，附带详细的错误信息
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: formattedErrors,
      });
    }

    // 如果是其他类型的错误，传递给 Express 的全局错误处理器
    next(error);
  }
};