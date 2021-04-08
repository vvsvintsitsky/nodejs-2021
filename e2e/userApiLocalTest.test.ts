import { startServer } from './util';

import { UserService } from '../src/service/UserService';
import { createApplication } from '../src/createApplication';
import { InMemoryUserStorage } from '../src/storage/InMemoryUserStorage';
import { findCommandLineArg } from '../src/utils/findCommandLineArg';

import { testUserApi } from './testUserApi';

const port = Number(findCommandLineArg('-p')) || 4000;

const [handle, serverStartPromise] = startServer(
    port,
    createApplication(new UserService(new InMemoryUserStorage()))
);

serverStartPromise
    .then(() => testUserApi('localhost', port))
    .finally(() => handle.server?.close());
