
# 构建阶段
FROM node:20-bullseye-slim AS builder

RUN corepack enable && corepack prepare pnpm@9.11.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
# RUN pnpm install --frozen-lockfile

# --- 添加这一行：安装编译原生模块所需的工具 ---
# RUN apk add --no-cache python3 make g++
# Debian-slim 只需要安装 build-essential 即可完成编译
RUN apt-get update && apt-get install -y build-essential python3
# ---------------------------------------------

# --- 关键修改：运行 pnpm install 并允许 better-sqlite3 运行编译脚本 ---
# 使用 --unsafe-perm 确保编译脚本能正确执行
RUN pnpm install --frozen-lockfile 
# ---------------------------------------------------------------------

COPY . .
RUN pnpm run build
# 数据库
# RUN pnpm drizzle-kit push

# 生产阶段
FROM node:20-bullseye-slim


RUN corepack enable && corepack prepare pnpm@9.11.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
# # 复制配置文件和数据库文件
# COPY --from=builder /app/drizzle.config.ts ./
# COPY --from=builder /app/sqlite.db* ./

# 创建必要的目录
RUN mkdir -p logs 

# RUN addgroup -g 1001 -S nodejs && \
#     adduser -S nodejs -u 1001 && \
#     chown -R nodejs:nodejs /app
# 正确的写法 (Debian 语法)
# RUN groupadd --system --gid 1001 nodejs && \
#     useradd --system --uid 1001 --gid nodejs nodejs && \
#     chown -R nodejs:nodejs /app

# --- 关键修改：修正用户创建、权限赋予和缓存目录 ---
# 1. 创建 nodejs 用户和组 (Debian 语法)
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nodejs

# 2. 创建核心包缓存目录并赋予权限
RUN mkdir -p /home/nodejs/.cache/node/corepack/v1 && \
    chown -R nodejs:nodejs /home/nodejs

# 3. 赋予 app 目录所有权
RUN chown -R nodejs:nodejs /app
# ----------------------------------------------------

USER nodejs

EXPOSE 3000

CMD ["node", "dist/server.js"]
