import express, { Express } from 'express';
import cors from 'cors';

import { UserService } from './service/UserService';
import { GroupService } from './service/GroupService';

import { createUserRouter } from './router/createUserRouter';
import { createGroupRouter } from './router/createGroupRouter';
import { createErrorHandlerMiddleware } from './error/errorHandlerMiddleware';
import { createRequestLoggingMiddleware } from './logger/createRequestLoggingMiddleware';
import { withRequestExecutionTimeLog } from './logger/withRequestExecutionTimeLog';
import { Context } from './context/Context';
import { AuthenticationService } from './service/AuthenticationService';
import { createLoginRouter } from './router/createLoginRouter';
import { createVerifyAuthenticationMiddleware } from './middleware/createVerifyAuthenticationMiddleware';

export function createApplication({
    userService,
    groupService,
    authenticationService,
    context
}: {
  userService: UserService;
  groupService: GroupService;
  authenticationService: AuthenticationService,
  context: Context;
}): Express {
    return express()
        .use(cors())
        .use(express.json())
        .use(withRequestExecutionTimeLog(createRequestLoggingMiddleware)(context))
        .use(createErrorHandlerMiddleware(context))
        .use(createLoginRouter(authenticationService, context))
        .use(createVerifyAuthenticationMiddleware(authenticationService, context))
        .use('/users', createUserRouter(userService, context))
        .use('/groups', createGroupRouter(groupService, context));
}
