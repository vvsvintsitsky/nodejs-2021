import { Router } from 'express';
import { Context } from '../context/Context';

import { EntityNotFoundError } from '../error/EntityNotFoundError';
import { UniqueConstraintViolationError } from '../error/UniqueConstraintViolationError';

import { UserService } from '../service/UserService';
import {
    createValidationMiddleware,
    extractDataFromParams
} from '../validation/createValidationMiddleware';
import {
    validateUserId,
    validateUser,
    validateAutosuggest
} from '../validation/userValidators';

const USER_PATH = '/user/:id';

export function createUserRouter(
    userService: UserService,
    context: Context
): Router {
    const router = Router();

    const userValidationMiddleware = createValidationMiddleware({
        validate: validateUser,
        context
    });

    const userIdValidationMiddleware = createValidationMiddleware({
        validate: validateUserId,
        extractDataToValidate: extractDataFromParams,
        context
    });

    const { requestLogger: logger, translationDictionary } = context;

    router.get(USER_PATH, userIdValidationMiddleware, async (req, res, next) => {
        const userId = req.params.id;

        try {
            res.json(await userService.getById(userId));
        } catch (error) {
            if (!(error instanceof EntityNotFoundError)) {
                return next(error);
            }

            logger.warn(error.message, { error });
            res.status(404).json(error.message);
        }
    });

    router.delete(
        USER_PATH,
        userIdValidationMiddleware,
        async (req, res, next) => {
            try {
                await userService.markAsDeleted(req.params.id);
                res.sendStatus(200);
            } catch (error) {
                return next(error);
            }
        }
    );

    router.put(USER_PATH, userValidationMiddleware, async (req, res, next) => {
        const userId = req.params.id;

        try {
            await userService.update(userId, req.body);
            res.sendStatus(200);
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                logger.warn(error.message, { error });
                res.status(404).json(error.message);
                return;
            }
            if (error instanceof UniqueConstraintViolationError) {
                logger.warn(error.message, {
                    error
                });
                res.status(422).json(translationDictionary.getTranslation('conflictData'));
                return;
            }
            return next(error);
        }
    });

    router.post('/create', userValidationMiddleware, async (req, res, next) => {
        try {
            await userService.create(req.body);
            res.sendStatus(201);
        } catch (error) {
            if (error instanceof UniqueConstraintViolationError) {
                logger.warn(error.message, {
                    error
                });
                res.status(422).json(translationDictionary.getTranslation('conflictData'));
                return;
            }
            return next(error);
        }
    });

    router.post(
        '/autoSuggest',
        createValidationMiddleware({
            validate: validateAutosuggest,
            context
        }),
        async (req, res, next) => {
            const { loginPart, limit } = req.body;
            try {
                res.json(await userService.getAutoSuggestUsers(loginPart, limit));
            } catch (error) {
                return next(error);
            }
        }
    );

    return router;
}
