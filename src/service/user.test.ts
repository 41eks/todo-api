
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/db/index.js';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// 正确模拟 drizzle-orm
vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as object, // 保留所有原始导出
    eq: vi.fn((a, b) => ({ type: 'eq', field: a, value: b }))
  };
});

// 模拟数据库模块
vi.mock('@/db/index.js', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
  }
}));

// 模拟 schema 以避免 sql 标签问题
vi.mock('@/db/schema', () => ({
  users: 'users_table_mock'
}));

// 导入要测试的函数（假设它们在一个文件中）
// 注意：实际使用时需要从正确的路径导入
import { createUser, findUserByName } from './user.js';

// 为了测试，我们在这里重新定义函数（实际测试时应从文件导入）

describe('User Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      // 模拟数据
      const mockUser = [{ id: 1, username: 'testuser', password: 'hashedpassword' }];
      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue(mockUser)
      };
      
      // 设置模拟返回值
      (db.insert as any).mockReturnValue(mockInsert);

      // 执行测试
      const result = await createUser('testuser', 'hashedpassword');

      // 断言
      expect(db.insert).toHaveBeenCalledWith(users);
      expect(mockInsert.values).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'hashedpassword'
      });
      expect(mockInsert.returning).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });


  });


});