import { createClient, RedisClientType } from "redis";

let client: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
    });

    client.on("error", (err: Error) => {
      console.error("Redis Client Error:", err);
    });

    await client.connect();
    console.log("Redis connected");
  }

  return client;
}


// 新增：用于 K8s 探针的快速检查
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const c = await getRedisClient();
    // 使用 Redis 的 PING 命令，正常会返回 "PONG"
    const res = await c.ping();
    return res === "PONG";
  } catch (err) {
    console.error("Redis Health Check Failed:", err);
    return false;
  }
}


export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
    console.log("Redis connection closed");
  }
}