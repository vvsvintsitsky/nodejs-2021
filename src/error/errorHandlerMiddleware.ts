import { NextFunction, Request, Response } from 'express';
import { Context } from '../context/Context';

export function createErrorHandlerMiddleware({
    requestLogger,
    translationDictionary
}: Context) {
    return function errorHandlerMiddleware(
        error: Error,
        req: Request,
        res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next: NextFunction
    ): void {
        requestLogger.error('Unhandled request error', req);

        res.status(500);
        res.send(translationDictionary.getTranslation('unhandledError'));
    };
}
