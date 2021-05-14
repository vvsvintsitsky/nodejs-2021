import { NextFunction, Request, Response } from 'express';

import { Context } from '../context/Context';
import { getCurrentTimeInNanos } from '../utils/getCurrentTimeInNanos';

interface Middleware {
  (req: Request, res: Response, next: NextFunction): void;
}

export function withRequestExecutionTimeLog(
    createMiddleware: (context: Context) => Middleware,
    getCurrentTime = getCurrentTimeInNanos
) {
    return function createRequestExecutionTimeLoggingMiddleware(
        context: Context
    ): Middleware {
        const middleware = createMiddleware(context);

        return function requestExecutionTimeLoggingMiddleware(
            req: Request,
            res: Response,
            next: NextFunction
        ): void {
            const startTime = getCurrentTime();

            res.on('finish', () => {
                context.requestLogger.info('Request time', req, {
                    ms: (getCurrentTime() - startTime) / BigInt(1_000_000)
                });
            });

            middleware(req, res, next);
        };
    };
}
