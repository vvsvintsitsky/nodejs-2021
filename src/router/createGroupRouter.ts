import { Router } from 'express';

import { Context } from '../context/Context';
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

export function createGroupRouter(
    groupService: GroupService,
    context: Context
): Router {
    const router = Router();

    const groupValidationMiddleware = createValidationMiddleware({
        validate: validateGroup,
        context
    });

    const groupIdValidationMiddleware = createValidationMiddleware({
        validate: validateGroupId,
        extractDataToValidate: extractDataFromParams,
        context
    });

    const groupIdAndUserIdsValidationMiddleware = createValidationMiddleware({
        validate: validateGroupIdAndUserIds,
        context
    });

    const { requestLogger: logger, translationDictionary } = context;

    router.get(
        GROUP_PATH,
        groupIdValidationMiddleware,
        async (req, res, next) => {
            try {
                res.json(await groupService.getById(req.params.id));
            } catch (error) {
                if (error instanceof EntityNotFoundError) {
                    logger.warn(error.message, req);
                    res.status(404).json(error.message);
                    return;
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
                logger.warn(error.message, req);
                res.status(404).json(error.message);
                return;
            }
            if (error instanceof UniqueConstraintViolationError) {
                logger.warn(error.message, req);
                res.status(422).json(translationDictionary.getTranslation('conflictData'));
                return;
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
                logger.warn(error.message, req);
                res.status(422).json(translationDictionary.getTranslation('conflictData'));
                return;
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
