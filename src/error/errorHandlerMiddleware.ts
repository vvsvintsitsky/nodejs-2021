import { NextFunction, Request, Response } from 'express';
import { CustomRequestError } from './CustomRequestError';

const DEFAULT_RESPONSE_DATA: [number, string] = [
    500,
    'An unknown error occured'
];

export function errorHandlerMiddleware(
    error: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
): void {
    const [statusCode, message] =
    error instanceof CustomRequestError
        ? [error.statusCode, error.message]
        : DEFAULT_RESPONSE_DATA;

    res.status(statusCode);
    res.send(message);
}
