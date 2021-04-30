import { NextFunction, Request, Response } from 'express';
import { Context } from '../context/Context';

import { Validator } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RequestPayload = Record<string, any>;

interface DataExtractor<T extends RequestPayload> {
  (req: Request): T;
}

export function extractDataFromBody<T extends RequestPayload>(req: Request): T {
    return req.body;
}

export function extractDataFromParams<T extends RequestPayload>(
    req: Request<T>
): T {
    return req.params;
}

export function createValidationMiddleware<T extends RequestPayload>({
    validate,
    extractDataToValidate = extractDataFromBody,
    context: { requestLogger, translationDictionary }
}: {
  validate: Validator<T>;
  extractDataToValidate?: DataExtractor<T>;
  context: Context;
}) {
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
            return next();
        }

        requestLogger.warn(translationDictionary.getTranslation('wrongInput'), req);

        res.status(400).json(errors);
    };
}
