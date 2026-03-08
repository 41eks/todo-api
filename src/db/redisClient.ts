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

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
    console.log("Redis connection closed");
  }
}