import knex from 'knex';

import { UserDataMapper } from './data-mapper/UserDataMapper';
import { GroupDataMapper } from './data-mapper/GroupDataMapper';

import { UserPersistentStorage } from './storage/UserPersistentStorage';
import { GroupPersistentStorage } from './storage/GroupPersistentStorage';

import { UserService } from './service/UserService';
import { GroupService } from './service/GroupService';

import { retryAction } from './utils/retryAction';

import { PORT, POOL_MIN_SIZE, POOL_MAX_SIZE } from './config';

import { createApplication } from './createApplication';
import { PostgresStorageErrorParser } from './storage/PostgresStorageErrorParser';

const port = process.env.PORT || PORT;

const poolMinSize =
  Number(process.env.DB_CONNECION_POOL_MIN_SIZE) || POOL_MIN_SIZE;
const poolMaxSize =
  Number(process.env.DB_CONNECION_POOL_MAX_SIZE) || POOL_MAX_SIZE;

const connection = knex({
    client: 'pg',
    connection: process.env.DATASOURCE_URL,
    pool: { min: poolMinSize, max: poolMaxSize }
});

(async () => {
    try {
        await retryAction(
            Number(process.env.DB_CONNECTION_RETRY_COUNT),
            () => connection.raw('select 1+1 as result'),
            'Failed to establish connection',
            Number(process.env.DB_CONNECION_RETRY_INTERVAL)
        );
    } catch (error) {
        console.log(error);
        return;
    }

    console.log('connection established');

    const dbErrorMapper = new PostgresStorageErrorParser();

    createApplication(
        new UserService(
            new UserPersistentStorage(connection, new UserDataMapper(), dbErrorMapper)
        ),
        new GroupService(
            new GroupPersistentStorage(
                connection,
                new GroupDataMapper(),
                dbErrorMapper
            )
        )
    ).listen(port, () => console.log(`server has started ${port}`));
})();
