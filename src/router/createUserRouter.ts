import { Router } from 'express';

import { CustomRequestError } from '../error/CustomRequestError';
import { EntityAlreadyExistsError } from '../error/EntityAlreadyExistsError';
import { EntityNotFoundError } from '../error/EntityNotFoundError';

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

    router.get(USER_PATH, userIdValidationMiddleware, async (req, res) => {
        const user = await userService.getById(req.params.id);

        if (user) {
            res.json(user);
            return;
        }

        res.sendStatus(404);
    });

    router.delete(USER_PATH, userIdValidationMiddleware, async (req, res) => {
        await userService.markAsDeleted(req.params.id);
        res.sendStatus(200);
    });

    router.put(USER_PATH, userValidationMiddleware, async (req, res, next) => {
        try {
            await userService.update(req.params.id, req.body);
            res.sendStatus(200);
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                return next(new CustomRequestError(404, error.message));
            }
            return next(error);
        }
    });

    router.post('/create', userValidationMiddleware, async (req, res, next) => {
        try {
            await userService.create(req.body);
            res.sendStatus(201);
        } catch (error) {
            if (error instanceof EntityAlreadyExistsError) {
                return next(new CustomRequestError(400, error.message));
            }
            return next(error);
        }
    });

    router.post(
        '/autoSuggest',
        createValidationMiddleware(validateAutosuggest),
        async (req, res) => {
            const { loginPart, limit } = req.body;
            res.json(await userService.getAutoSuggestUsers(loginPart, limit));
        }
    );

    return router;
}
