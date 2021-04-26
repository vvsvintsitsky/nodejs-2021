import { Router } from 'express';
import { ConflictDataRequestError } from '../error/ConflictDataRequestError';

import { CustomRequestError } from '../error/CustomRequestError';
import { EntityNotFoundError } from '../error/EntityNotFoundError';
import { UniqueConstraintViolationError } from '../error/UniqueConstraintViolationError';
import { GroupService } from '../service/GroupService';

import {
    createValidationMiddleware,
    extractDataFromParams
} from '../validation/createValidationMiddleware';
import {
    validateGroupId,
    validateGroup,
    validateGroupIdAndUserIds
} from '../validation/groupValidators';

const GROUP_PATH = '/group/:id';

const groupValidationMiddleware = createValidationMiddleware(validateGroup);

const groupIdValidationMiddleware = createValidationMiddleware(
    validateGroupId,
    extractDataFromParams
);

const groupIdAndUserIdsValidationMiddleware = createValidationMiddleware(
    validateGroupIdAndUserIds
);

export function createGroupRouter(groupService: GroupService): Router {
    const router = Router();

    router.get(
        GROUP_PATH,
        groupIdValidationMiddleware,
        async (req, res, next) => {
            try {
                res.json(await groupService.getById(req.params.id));
            } catch (error) {
                if (error instanceof EntityNotFoundError) {
                    return next(new CustomRequestError(404, error.message));
                }
                return next(error);
            }
        }
    );

    router.delete(
        GROUP_PATH,
        groupIdValidationMiddleware,
        async (req, res, next) => {
            try {
                await groupService.delete(req.params.id);
                res.sendStatus(200);
            } catch (error) {
                return next(error);
            }
        }
    );

    router.put(GROUP_PATH, groupValidationMiddleware, async (req, res, next) => {
        try {
            await groupService.update(req.params.id, req.body);
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

    router.post('/create', groupValidationMiddleware, async (req, res, next) => {
        try {
            await groupService.create(req.body);
            res.sendStatus(201);
        } catch (error) {
            if (error instanceof UniqueConstraintViolationError) {
                return next(new ConflictDataRequestError());
            }
            return next(error);
        }
    });

    router.get('/all', async (_, res, next) => {
        try {
            res.json(await groupService.getAll());
        } catch (error) {
            return next(error);
        }
    });

    router.post(
        '/addUsers',
        groupIdAndUserIdsValidationMiddleware,
        async (req, res, next) => {
            const { groupId, userIds } = req.body;
            try {
                await groupService.addUsersToGroup(groupId, userIds);
                res.sendStatus(201);
            } catch (error) {
                return next(error);
            }
        }
    );

    return router;
}
