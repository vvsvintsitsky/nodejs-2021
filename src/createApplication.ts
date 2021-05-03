import express, { Express } from 'express';

import { UserService } from './service/UserService';
import { GroupService } from './service/GroupService';

import { createUserRouter } from './router/createUserRouter';
import { createGroupRouter } from './router/createGroupRouter';
import { createErrorHandlerMiddleware } from './error/errorHandlerMiddleware';
import { Context } from './context/Context';

export function createApplication({
    userService,
    groupService,
    context
}: {
  userService: UserService;
  groupService: GroupService;
  context: Context,
}): Express {
    return express()
        .use(express.json())
        .use(createErrorHandlerMiddleware(context))
        .use('/users', createUserRouter(userService, context))
        .use('/groups', createGroupRouter(groupService, context));
}
