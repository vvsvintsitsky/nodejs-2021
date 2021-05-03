import { NextFunction, Request, Response } from 'express';

import { Context } from '../context/Context';

export function createRequestLoggingMiddleware(
    { requestLogger }: Context) {
    return function schemaValidationMiddleware(
        req: Request,
        _: Response,
        next: NextFunction
    ): void {
        requestLogger.info('Incoming request', req);

        next();
    };
}
