// global.d.ts

// 声明全局类型
declare global {
    /**
     * 成功时: { err: null, data: T }
     * 失败时: { err: E, data: null }
     */
    type Result<T, E = Error> =
        | { err: null; data: T }
        | { err: E; data: null };
}

// 必须导出一个空对象，强制 TS 将此文件视为模块
export { };