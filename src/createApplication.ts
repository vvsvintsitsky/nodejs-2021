import express, { Express } from 'express';

import { UserService } from './service/UserService';
import { createUserRouter } from './router/createUserRouter';
import { createErrorHandlerMiddleware } from './error/errorHandlerMiddleware';
import { Context } from './context/Context';

export function createApplication({
    userService,
    context
}: {
  userService: UserService;
  context: Context,
}): Express {
    return express()
        .use(express.json())
        .use(createErrorHandlerMiddleware(context))
        .use('/users', createUserRouter(userService, context));
}
