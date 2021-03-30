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

    router.get(USER_PATH, userIdValidationMiddleware, (req, res) => {
        const user = userService.getById(req.params.id);

        if (user) {
            res.json(user);
            return;
        }

        res.sendStatus(404);
    });

    router.delete(USER_PATH, userIdValidationMiddleware, (req, res) => {
        userService.markAsDeleted(req.params.id);
        res.sendStatus(200);
    });

    router.put(USER_PATH, userValidationMiddleware, (req, res, next) => {
        try {
            userService.update(req.params.id, req.body);
            res.sendStatus(200);
        } catch (error) {
            const errorToThrow =
        error instanceof EntityNotFoundError
            ? new CustomRequestError(404, error.message)
            : error;
            return next(errorToThrow);
        }
    });

    router.post('/create', userValidationMiddleware, (req, res, next) => {
        try {
            userService.create(req.body);
            res.sendStatus(201);
        } catch (error) {
            const errorToThrow =
        error instanceof EntityAlreadyExistsError
            ? new CustomRequestError(400, error.message)
            : error;
            return next(errorToThrow);
        }
    });

    router.post(
        '/autoSuggest',
        createValidationMiddleware(validateAutosuggest),
        (req, res) => {
            const { loginPart, limit } = req.body;
            res.json(userService.getAutoSuggestUsers(loginPart, limit));
        }
    );

    return router;
}
