import express, { Express } from 'express';

import { UserService } from './service/UserService';
import { GroupService } from './service/GroupService';

import { createUserRouter } from './router/createUserRouter';
import { createGroupRouter } from './router/createGroupRouter';

import { errorHandlerMiddleware } from './error/errorHandlerMiddleware';

export function createApplication(userService: UserService, groupService: GroupService): Express {
    return express()
        .use(express.json())
        .use(errorHandlerMiddleware)
        .use('/users', createUserRouter(userService))
        .use('/groups', createGroupRouter(groupService));
}
