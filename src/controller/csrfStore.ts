import { getRedisClient } from "@/db/redisClient.js";

const CSRF_PREFIX = "csrf:";

// 存储 csrfToken
export async function saveCsrfToken(
    userId: string,
    csrfToken: string,
    ttlSeconds = 60 * 60 * 24 // 默认 1 天
): Promise<void> {
    const redis = await getRedisClient();

    const key = `${CSRF_PREFIX}${userId}`;

    await redis.set(key, csrfToken, {
        EX: ttlSeconds
    });
}

// 读取 csrfToken
export async function getCsrfToken(userId: string): Promise<string | null> {
    const redis = await getRedisClient();

    const key = `${CSRF_PREFIX}${userId}`;

    return await redis.get(key);
}

// 删除 csrfToken（登出时用）
export async function deleteCsrfToken(userId: string): Promise<void> {
    const redis = await getRedisClient();

    const key = `${CSRF_PREFIX}${userId}`;

    await redis.del(key);
}