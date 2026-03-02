// // types/express.d.ts
// import 'express';

// declare module 'express-serve-static-core' {
//     interface Request {
//         userId?: number;
//     }
// }

// types/express.d.ts
import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            // 在这里添加你需要的自定义属性
            user?: { id: number };
        }
    }
}