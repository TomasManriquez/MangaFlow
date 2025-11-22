// Logger Middleware

import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Log response after completion
    res.on('finish', () => {
        const duration = Date.now() - start;
        const timestamp = new Date().toISOString();
        const { method, originalUrl } = req;
        const { statusCode } = res;

        // Color code based on status
        const statusColor =
            statusCode >= 500 ? '\x1b[31m' : // Red
                statusCode >= 400 ? '\x1b[33m' : // Yellow
                    statusCode >= 300 ? '\x1b[36m' : // Cyan
                        '\x1b[32m'; // Green

        const reset = '\x1b[0m';

        console.log(
            `${timestamp} ${method} ${originalUrl} ${statusColor}${statusCode}${reset} ${duration}ms`
        );
    });

    next();
};

export default logger;
