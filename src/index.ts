import knex from 'knex';

import { InMemoryUserStorage } from './storage/InMemoryUserStorage';
import { UserService } from './service/UserService';
import { findCommandLineArg } from './utils/findCommandLineArg';
import { retryAction } from './utils/retryAction';

import { PORT } from './config';

import { createApplication } from './createApplication';

const port = process.env.PORT || findCommandLineArg('-p') || PORT;

const connection = knex({
    client: 'pg',
    connection: process.env.DATASOURCE_URL,
    pool: { min: 0, max: 4 }
});

(async () => {
    try {
        await retryAction(
            Number(process.env.DB_CONNECTION_RETRY_COUNT),
            () => connection.raw('select 1+1 as result'),
            'Failed to establish connection',
            Number(process.env.DB_CONNECION_RETRY_INTERVAL)
        );

        console.log('connection created');

        createApplication(new UserService(new InMemoryUserStorage())).listen(
            port,
            () => console.log(`server has started ${port}`)
        );
    } catch (error) {
        console.log(error);
    }
})();
