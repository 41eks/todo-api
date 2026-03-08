
import { app } from './app.js';
import { getRedisClient, closeRedis } from './db/redisClient.js';
const port = process.env.EXPRESS_PORT ?? 3000
const server = app.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}`);
    await getRedisClient()
});



async function shutdown(): Promise<void> {
    console.log("Shutting down server...");

    server.close(async () => {
        console.log("HTTP server closed");

        await closeRedis();

        process.exit(0);
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);