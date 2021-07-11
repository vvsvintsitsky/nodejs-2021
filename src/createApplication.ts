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
import { createFileUploadRouter } from './createFileUploadRouter';
import { createJsonEchoRouter } from './createJsonEchoRouter';

export function createApplication({
    userService,
    groupService,
    authenticationService,
    context,
    uploadDirectory,
    uploadFolderName,
}: {
  userService: UserService;
  groupService: GroupService;
  authenticationService: AuthenticationService,
  context: Context;
  uploadDirectory: string;
  uploadFolderName: string;
}): Express {
    return express()
        .use(cors())
        .use(createFileUploadRouter(context, uploadDirectory, uploadFolderName))
        .use(express.json())
        .use(createJsonEchoRouter(context))
        .use(withRequestExecutionTimeLog(createRequestLoggingMiddleware)(context))
        .use(createErrorHandlerMiddleware(context))
        .use(createLoginRouter(authenticationService, context))
        .use(createVerifyAuthenticationMiddleware(authenticationService, context))
        .use('/users', createUserRouter(userService, context))
        .use('/groups', createGroupRouter(groupService, context));
}
