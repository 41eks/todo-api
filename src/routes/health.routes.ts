import express, { Router } from 'express';
// 导入你之前的工具函数
import { checkRedisHealth } from '@/db/redisClient.js';
import { checkConnection as checkSqliteHealth } from '@/db/index.js'

const router: Router = express.Router();

/**
 * Liveness Probe: /healthz
 * 仅检查进程是否在线
 */
router.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});
import { getErrorMessage } from '@/types/assert.js';
/**
 * Readiness Probe: /ready
 * 检查核心依赖（SQLite, Redis）
 */
router.get('/ready', async (req, res) => {
    try {
        // 并行检查多个依赖，提高效率
        const [isRedisOk, isDbOk] = await Promise.all([
            checkRedisHealth(),
            Promise.resolve(checkSqliteHealth()) // 假设这个是同步的，包装成 Promise
        ]);

        if (isRedisOk && isDbOk) {
            res.status(200).json({
                status: 'ready',
                checks: {
                    redis: 'up',
                    db: 'up'
                }
            });
        } else {
            res.status(503).json({
                status: 'down',
                checks: {
                    redis: isRedisOk ? 'up' : 'down',
                    db: isDbOk ? 'up' : 'down'
                }
            });
        }
    } catch (error: unknown) {
        res.status(500).json({
            status: 'error',
            message: getErrorMessage(error)
        });
    }
});

export default router;