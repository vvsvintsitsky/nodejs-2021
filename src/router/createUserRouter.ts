import { Router } from 'express';
import { ConflictDataRequestError } from '../error/ConflictDataRequestError';

import { CustomRequestError } from '../error/CustomRequestError';
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

const userValidationMiddleware = createValidationMiddleware(validateUser);

const userIdValidationMiddleware = createValidationMiddleware(
    validateUserId,
    extractDataFromParams
);

export function createUserRouter(userService: UserService): Router {
    const router = Router();

    router.get(USER_PATH, userIdValidationMiddleware, async (req, res, next) => {
        try {
            res.json(await userService.getById(req.params.id));
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                return next(new CustomRequestError(404, error.message));
            }
            return next(error);
        }
    });

    router.delete(USER_PATH, userIdValidationMiddleware, async (req, res, next) => {
        try {
            await userService.markAsDeleted(req.params.id);
            res.sendStatus(200);
        } catch (error) {
            return next(error);
        }
    });

    router.put(USER_PATH, userValidationMiddleware, async (req, res, next) => {
        try {
            await userService.update(req.params.id, req.body);
            res.sendStatus(200);
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                return next(new CustomRequestError(404, error.message));
            }
            if (error instanceof UniqueConstraintViolationError) {
                return next(new ConflictDataRequestError());
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
                return next(new ConflictDataRequestError());
            }
            return next(error);
        }
    });

    router.post(
        '/autoSuggest',
        createValidationMiddleware(validateAutosuggest),
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
