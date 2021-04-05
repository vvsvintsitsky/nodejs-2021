import express, { Express } from 'express';

import { UserService } from './service/UserService';
import { createUserRouter } from './router/createUserRouter';
import { errorHandlerMiddleware } from './error/errorHandlerMiddleware';

export function createApplication(userService: UserService): Express {
    return express()
        .use(express.json())
        .use(errorHandlerMiddleware)
        .use('/users', createUserRouter(userService));
}
