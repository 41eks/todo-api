
# 构建阶段
FROM node:20-bullseye-slim AS builder

RUN corepack enable && corepack prepare pnpm@9.11.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
# RUN pnpm install --frozen-lockfile

# --- 添加这一行：安装编译原生模块所需的工具 ---
# RUN apk add --no-cache python3 make g++
# Debian-slim 只需要安装 build-essential 即可完成编译
RUN apt-get update && \
    apt-get install -y build-essential python3 && \
    rm -rf /var/lib/apt/lists/*
# ---------------------------------------------

# --- 关键修改：运行 pnpm install 并允许 better-sqlite3 运行编译脚本 ---
# 使用 --unsafe-perm 确保编译脚本能正确执行
RUN pnpm install --frozen-lockfile 
# ---------------------------------------------------------------------

COPY . .
RUN pnpm run build
# 数据库


# 生产阶段
FROM node:20-bullseye-slim

WORKDIR /app

# 只复制必要文件
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# migrator
COPY --from=builder /app/drizzle ./drizzle

COPY package.json pnpm-lock.yaml ./


# 创建必要的目录
RUN mkdir -p logs 


COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# RUN addgroup -g 1001 -S nodejs && \
#     adduser -S nodejs -u 1001 && \
#     chown -R nodejs:nodejs /app
# 正确的写法 (Debian 语法)
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nodejs && \
    chown -R nodejs:nodejs /app


USER nodejs

EXPOSE 3000


CMD ["./entrypoint.sh"]
