import { Router } from 'express';

import { Context } from '../context/Context';
import { EntityNotFoundError } from '../error/EntityNotFoundError';
import { AuthenticationService } from '../service/AuthenticationService';

export function createLoginRouter(
    authenticationService: AuthenticationService,
    { translationDictionary, requestLogger }: Context
): Router {
    const router = Router();

    router.post('/login', async (req, res, next) => {
        const { login, password } = req.body;
        try {
            res.json({
                token: await authenticationService.authenticate(login, password)
            });
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                requestLogger.warn(error.message, req);
                res.status(403).json(translationDictionary.getTranslation('loginFailed'));
                return;
            }
            return next(error);
        }
    });

    return router;
}
