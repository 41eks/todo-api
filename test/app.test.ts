
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app.js'; // 引入你的 app 实例

describe('HTTP API 集成测试', () => {
    it('应该成功login', async () => {
        const newUser = { username: 'testuser', password: "plain_text_password_123" };

        const response = await request(app)
            .post('/api/login')
            .send(newUser) // 发送请求体
            .set('Accept', 'application/json')
            .expect(200);
console.log(response.body.message)
        // expect(response.body.message).toBe('User created');
        // expect(response.body.user).toEqual(newUser);
    });

    // // 测试 GET 接口
    // it('应该成功获取用户数据', async () => {
    //     const response = await request(app)
    //         .get('/api/users/123')
    //         .expect('Content-Type', /json/) // 验证 Content-Type
    //         .expect(200); // 验证状态码

    //     expect(response.body).toEqual({ id: '123', name: 'John Doe' });
    // });

    // // 测试 POST 接口
    // it('应该成功创建用户', async () => {
    //     const newUser = { name: 'Jane Doe', email: 'jane@example.com' };

    //     const response = await request(app)
    //         .post('/api/users')
    //         .send(newUser) // 发送请求体
    //         .set('Accept', 'application/json')
    //         .expect(201);

    //     expect(response.body.message).toBe('User created');
    //     expect(response.body.user).toEqual(newUser);
    // });
});