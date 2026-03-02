
import { app } from './app.js';
const port = process.env.EXPRESS_PORT ?? 3000
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// 应用退出时关闭
process.on('SIGINT', async () => {
    // await client.close();
    process.exit(0);
});