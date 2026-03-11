# ✅ Todo List Full-Stack API

基于 **Express** + **Drizzle ORM** + **SQLite** 构建的高性能后端服务。针对 **Cloudflare** 代理环境及 **Nginx** 跨域场景进行了深度适配。

---

## 🛠 技术栈
- **核心框架**: Express.js 5.x (Node.js)
- **数据库**: SQLite (由 `better-sqlite3` 驱动)
- **ORM**: Drizzle ORM (类型安全，原生性能)
- **安全认证**: JWT + Cookie (Refresh Token 机制) + CSRF 防护
- **缓存**: Redis (支持集成)
- **自动化测试**: Vitest + Supertest
- **部署方式**: Docker + Nginx + Cloudflare

---

## 📂 项目结构
```text
.
├── src/
│   ├── db/                # 数据库初始化、Schema 定义及 Migrator
│   ├── controller/        # 业务控制器 (Login, Logout, Todo, etc.)
│   ├── middleware/        # 认证与校验中间件
│   ├── routes/            # 路由定义
│   ├── service/           # 核心业务逻辑
│   └── app.ts             # 应用入口
├── drizzle/               # 数据库迁移快照文件
├── test/                  # 集成测试用例
├── todo-nginx.conf        # 预设的 Nginx 反向代理配置
├── sqlite.db              # SQLite 数据库文件 (持久化)
└── docker-compose.yaml    # Docker 编排配置
```


---

## 🗄 数据库设计

项目使用 Drizzle ORM 管理 SQLite 表结构，核心包含：

1. **Users (用户表)**: 存储身份凭证与加密密码。
2. **Todos (待办事项表)**: 存储任务内容、优先级 (`Low/Medium/High`) 及完成状态，通过 `user_id` 实现多用户隔离。

---

## 🚀 快速部署指南

### 第一步：环境初始化

```bash
# 创建项目目录
mkdir todo-api && cd todo-api

# 下载 Docker 配置文件示例
curl -L [https://github.com/41eks/todo-api/blob/master/docker-compose.yaml.example](https://github.com/41eks/todo-api/blob/master/docker-compose.yaml.example) -o ./docker-compose.yaml

# 创建持久化文件与目录
touch ./sqlite.db
mkdir ./logs

# 关键：设置权限确保 Docker 内 Node 用户 (UID 1001) 可读写
sudo chmod -R 1001:1001 ./sqlite.db ./logs

```

### 第二步：启动服务

```bash
# 根据需求修改环境变量（如 JWT_SECRET 等）
vim docker-compose.yaml

# 启动容器
docker compose up -d

```

### 第三步：配置 Nginx 代理（跨域适配）

针对 **Cloudflare** 环境，使用提供的 `todo-nginx.conf`：

```bash
# 复制配置文件到 Nginx 目录
curl -L https://github.com/41eks/todo-api/blob/master/todo-nginx.conf -o /etc/nginx/conf.d/todo-api.conf

# 检查并重启
sudo nginx -t
sudo systemctl restart nginx

```

---

## 🛡 安全与跨域 (CORS) 深度适配说明

为了确保在 **Cloudflare** 代理模式下登录态不丢失，本项目在 `src/controller/cookieSetting.ts` 中做了如下处理：

1. **SameSite 策略**: 默认 `Lax`。要求前后端必须在**同站**下（例如 `app.domain.org` 和 `api.domain.org`）。
2. **Domain 共享**: 请在配置中将 `COMMON_DOMAIN` 设为父级域名（如 `.rainbowgem.dpdns.org`），否则子域名间无法传递 Cookie。
3. **凭证共享**: 前端 Axios/Fetch 必须显式开启 `{ withCredentials: true }`。
4. **HTTPS 头部**: Nginx 已配置 `X-Forwarded-Proto https`，确保后端能正确识别 Cloudflare 转发的加密协议。

---
