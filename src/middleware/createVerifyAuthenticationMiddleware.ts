import { NextFunction, Request, Response } from 'express';
import { Context } from '../context/Context';
import { AuthenticationService } from '../service/AuthenticationService';

export function createVerifyAuthenticationMiddleware(
    autheticationService: AuthenticationService,
    { translationDictionary, requestLogger }: Context
) {
    return function verifyAuthenticationMiddleware(
        req: Request,
        res: Response,
        next: NextFunction
    ): void {
        const authHeaderValue = req.headers.authorization;

        if (!authHeaderValue) {
            res
                .status(401)
                .json(translationDictionary.getTranslation('unauthorized'));
            requestLogger.warn('Unauthorized', req);
            return;
        }

        const isValidToken = autheticationService.verifyToken(authHeaderValue);
        if (!isValidToken) {
            res.status(403).json(translationDictionary.getTranslation('forbidden'));
            requestLogger.warn('Invalid token', req);
            return;
        }

        next();
    };
}
