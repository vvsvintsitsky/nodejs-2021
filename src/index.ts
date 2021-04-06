import { InMemoryUserStorage } from './storage/InMemoryUserStorage';
import { UserService } from './service/UserService';
import { findCommandLineArg } from './utils/findCommandLineArg';

import { PORT } from './config';

import { createApplication } from './createApplication';

const port = process.env.PORT || findCommandLineArg('-p') || PORT;

createApplication(new UserService(new InMemoryUserStorage())).listen(port, () =>
    console.log(`server has started ${port}`)
);
