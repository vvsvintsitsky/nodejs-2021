import { NextFunction, Request, Response } from 'express';

import { Validator } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RequestPayload = Record<string, any>;

interface DataExtractor<T extends RequestPayload> {
    (req: Request): T;
}

export function extractDataFromBody<T extends RequestPayload>(req: Request): T {
    return req.body;
}

export function extractDataFromParams<T extends RequestPayload>(req: Request<T>): T {
    return req.params;
}

export function createValidationMiddleware<T extends RequestPayload>(
    validate: Validator<T>,
    extractDataToValidate: DataExtractor<T> = extractDataFromBody
) {
    return function schemaValidationMiddleware(
        req: Request,
        res: Response,
        next: NextFunction
    ): void {
        const errors = validate(extractDataToValidate(req))?.map(
            ({ message, dataPath }) => ({
                message,
                dataPath
            })
        );

        if (!errors) {
            // eslint-disable-next-line callback-return
            next();
        } else {
            res.status(400).json(errors);
        }
    };
}
