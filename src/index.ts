import path from 'path';

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
import { createLogger } from './logger/createLogger';
import { RequestLogger } from './logger/RequestLogger';
import { TranslationDictionary } from './translation/TranslationDictionary';

import messages from './messages/messages.json';

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

const logger = createLogger(
    path.join(process.cwd(), 'logs', 'application-%DATE%.log')
);
const requestLogger = new RequestLogger(logger);

(async () => {
    try {
        await retryAction(
            Number(process.env.DB_CONNECTION_RETRY_COUNT),
            () => connection.raw('select 1+1 as result'),
            'Failed to establish connection',
            Number(process.env.DB_CONNECION_RETRY_INTERVAL)
        );
    } catch (error) {
        logger.error(error);
        return;
    }

    logger.info('connection established');

    const dbErrorMapper = new PostgresStorageErrorParser();

    createApplication({
        context: {
            logger,
            translationDictionary: new TranslationDictionary(messages),
            requestLogger
        },
        userService: new UserService(
            new UserPersistentStorage(connection, new UserDataMapper(), dbErrorMapper)
        ),
        groupService: new GroupService(
            new GroupPersistentStorage(
                connection,
                new GroupDataMapper(),
                dbErrorMapper
            )
        )
    }).listen(port, () => logger.info(`server has started ${port}`));
})();
