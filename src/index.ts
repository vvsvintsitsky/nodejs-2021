import { InMemoryUserStorage } from './storage/InMemoryUserStorage';
import { UserService } from './service/UserService';

import { PORT } from './config';

import { createApplication } from './createApplication';

createApplication(new UserService(new InMemoryUserStorage())).listen(PORT, () =>
    console.log('server has started')
);
