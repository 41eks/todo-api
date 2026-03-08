import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from './db/index';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { LoginSchema, validateLogin } from './auth.js'; // 替换为实际路径

// 首先模拟所有依赖，必须在导入之前
vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as object,
    eq: vi.fn((a, b) => ({ type: 'eq', field: a, value: b }))
  };
});

vi.mock('./db/index', () => ({
  db: {
    select: vi.fn(),
  }
}));

vi.mock('./db/schema', () => ({
  users: 'users_table_mock'
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn()
  }
}));

// 现在导入要测试的模块
describe('validateLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LoginSchema validation', () => {
    it('should validate correct login data', () => {
      const validData = {
        username: 'testuser',
        password: 'password123'
      };

      const result = LoginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty username', () => {
      const invalidData = {
        username: '',
        password: 'password123'
      };

      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('用户名不能为空');
      }
    });

    it('should reject empty password', () => {
      const invalidData = {
        username: 'testuser',
        password: ''
      };

      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('密码不能为空');
      }
    });
  });

  describe('validateLogin function', () => {
    it('should return success with userId when credentials are valid', async () => {
      // 模拟数据
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashed_password'
      };

      // 模拟数据库查询
      const mockGet = vi.fn().mockResolvedValue(mockUser);
      const mockWhere = vi.fn().mockReturnValue({ get: mockGet });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      
      (db.select as any).mockReturnValue({ from: mockFrom });

      // 模拟 bcrypt 比较
      (bcrypt.compare as any).mockResolvedValue(true);

      // 执行测试
      const result = await validateLogin({
        username: 'testuser',
        password: 'correctpassword'
      });

      // 断言
      expect(db.select).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(users);
      expect(mockWhere).toHaveBeenCalledWith({ type: 'eq', field: users.username, value: 'testuser' });
      expect(mockGet).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith('correctpassword', 'hashed_password');
      expect(result).toEqual({ success: true, userId: 1 });
    });

    it('should return error message when user does not exist', async () => {
      // 模拟数据库查询返回空结果
      const mockGet = vi.fn().mockResolvedValue(undefined);
      const mockWhere = vi.fn().mockReturnValue({ get: mockGet });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      
      (db.select as any).mockReturnValue({ from: mockFrom });

      // 执行测试
      const result = await validateLogin({
        username: 'nonexistent',
        password: 'password123'
      });

      // 断言
      expect(db.select).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(users);
      expect(mockWhere).toHaveBeenCalled();
      expect(mockGet).toHaveBeenCalled();
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false, message: '用户不存在' });
    });

    it('should return error message when password is incorrect', async () => {
      // 模拟数据
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashed_password'
      };

      // 模拟数据库查询
      const mockGet = vi.fn().mockResolvedValue(mockUser);
      const mockWhere = vi.fn().mockReturnValue({ get: mockGet });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      
      (db.select as any).mockReturnValue({ from: mockFrom });

      // 模拟 bcrypt 比较返回 false
      (bcrypt.compare as any).mockResolvedValue(false);

      // 执行测试
      const result = await validateLogin({
        username: 'testuser',
        password: 'wrongpassword'
      });

      // 断言
      expect(db.select).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(users);
      expect(mockWhere).toHaveBeenCalled();
      expect(mockGet).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashed_password');
      expect(result).toEqual({ success: false, message: '密码错误' });
    });

    it('should handle database errors', async () => {
      // 模拟数据库查询抛出错误
      const mockGet = vi.fn().mockRejectedValue(new Error('Database connection failed'));
      const mockWhere = vi.fn().mockReturnValue({ get: mockGet });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      
      (db.select as any).mockReturnValue({ from: mockFrom });

      // 执行测试并断言错误
      await expect(validateLogin({
        username: 'testuser',
        password: 'password123'
      })).rejects.toThrow('Database connection failed');
    });

    it('should handle bcrypt errors', async () => {
      // 模拟数据
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashed_password'
      };

      // 模拟数据库查询
      const mockGet = vi.fn().mockResolvedValue(mockUser);
      const mockWhere = vi.fn().mockReturnValue({ get: mockGet });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      
      (db.select as any).mockReturnValue({ from: mockFrom });

      // 模拟 bcrypt 比较抛出错误
      (bcrypt.compare as any).mockRejectedValue(new Error('Bcrypt error'));

      // 执行测试并断言错误
      await expect(validateLogin({
        username: 'testuser',
        password: 'password123'
      })).rejects.toThrow('Bcrypt error');
    });
  });

  describe('Integration tests', () => {
    it('should handle the complete flow with valid credentials', async () => {
      // 模拟所有步骤
      const mockUser = {
        id: 42,
        username: 'john_doe',
        password: '$2a$10$XJpYqJqYqJqYqJqYqJqYqO' // 模拟的 bcrypt hash
      };

      const mockGet = vi.fn().mockResolvedValue(mockUser);
      const mockWhere = vi.fn().mockReturnValue({ get: mockGet });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      
      (db.select as any).mockReturnValue({ from: mockFrom });
      (bcrypt.compare as any).mockResolvedValue(true);

      // 执行测试
      const result = await validateLogin({
        username: 'john_doe',
        password: 'correctpassword'
      });

      // 验证
      expect(result).toEqual({ success: true, userId: 42 });
      expect(bcrypt.compare).toHaveBeenCalledWith('correctpassword', mockUser.password);
    });

    it('should handle SQL injection attempts safely', async () => {
      // 模拟数据库查询（实际中参数化查询会处理 SQL 注入）
      const mockGet = vi.fn().mockResolvedValue(undefined);
      const mockWhere = vi.fn().mockReturnValue({ get: mockGet });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      
      (db.select as any).mockReturnValue({ from: mockFrom });

      // 尝试 SQL 注入
      const result = await validateLogin({
        username: "' OR '1'='1",
        password: "' OR '1'='1"
      });

      // 验证 - 由于使用了参数化查询，应该返回用户不存在
      expect(result).toEqual({ success: false, message: '用户不存在' });
      // 验证 eq 函数被调用时没有修改输入
      expect(mockWhere).toHaveBeenCalledWith({ 
        type: 'eq', 
        field: users.username, 
        value: "' OR '1'='1" 
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle very long username', async () => {
      const longUsername = 'a'.repeat(1000);
      const mockGet = vi.fn().mockResolvedValue(undefined);
      const mockWhere = vi.fn().mockReturnValue({ get: mockGet });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      
      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await validateLogin({
        username: longUsername,
        password: 'password123'
      });

      expect(result).toEqual({ success: false, message: '用户不存在' });
    });

    it('should handle Unicode characters in username', async () => {
      const unicodeUsername = '用户测试';
      const mockUser = {
        id: 1,
        username: unicodeUsername,
        password: 'hashed_password'
      };

      const mockGet = vi.fn().mockResolvedValue(mockUser);
      const mockWhere = vi.fn().mockReturnValue({ get: mockGet });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      
      (db.select as any).mockReturnValue({ from: mockFrom });
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await validateLogin({
        username: unicodeUsername,
        password: 'password123'
      });

      expect(result).toEqual({ success: true, userId: 1 });
    });
  });
});