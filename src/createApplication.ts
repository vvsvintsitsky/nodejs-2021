import express, { Express } from 'express';

import { UserService } from './service/UserService';
import { createUserRouter } from './router/createUserRouter';

export function createApplication(userService: UserService): Express {
    return express()
        .use(express.json())
        .use('/users', createUserRouter(userService));
}
