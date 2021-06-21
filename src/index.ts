import path from 'path';

import config from 'config';

import knex from 'knex';

import { UserDataMapper } from './data-mapper/UserDataMapper';
import { GroupDataMapper } from './data-mapper/GroupDataMapper';

import { UserPersistentStorage } from './storage/UserPersistentStorage';
import { GroupPersistentStorage } from './storage/GroupPersistentStorage';

import { UserService } from './service/UserService';
import { GroupService } from './service/GroupService';

import { retryAction } from './utils/retryAction';

import { createApplication } from './createApplication';
import { PostgresStorageErrorParser } from './storage/PostgresStorageErrorParser';
import { createLogger } from './logger/createLogger';
import { RequestLogger } from './logger/RequestLogger';
import { TranslationDictionary } from './translation/TranslationDictionary';

import messages from './messages/messages.json';
import { AuthenticationService } from './service/AuthenticationService';
import { DataSourceConfig, TokenConfig } from './config/types';

const port = process.env.PORT || config.get('port');

const dbConfig = config.get<DataSourceConfig>('dataSource');

const poolMinSize =
  Number(process.env.DB_CONNECION_POOL_MIN_SIZE) || dbConfig.pool.minSize;
const poolMaxSize =
  Number(process.env.DB_CONNECION_POOL_MAX_SIZE) || dbConfig.pool.maxSize;


const tokenConfig = config.get<TokenConfig>('token');

const tokenSecret = process.env.TOKEN_SECRET ?? tokenConfig.secret;
const tokenExpirationTimeSeconds =
  Number(process.env.TOKEN_EXPIRATION_TIME_SECONDS) ?? tokenConfig.expirationTime;

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
        logger.error(error.message);
        return;
    }

    logger.info('connection established');

    const dbErrorMapper = new PostgresStorageErrorParser();

    const userStorage = new UserPersistentStorage(
        connection,
        new UserDataMapper(),
        dbErrorMapper
    );

    createApplication({
        context: {
            translationDictionary: new TranslationDictionary(messages),
            requestLogger
        },
        userService: new UserService(userStorage),
        groupService: new GroupService(
            new GroupPersistentStorage(
                connection,
                new GroupDataMapper(),
                dbErrorMapper
            )
        ),
        authenticationService: new AuthenticationService(
            userStorage,
            tokenExpirationTimeSeconds,
            tokenSecret
        )
    }).listen(port, () => logger.info(`server has started ${port}`));
})();

function logUncaughtError(error: Error) {
    logger.error(error.message, { ...error });
}
process.on('uncaughtException', logUncaughtError);
process.on('unhandledRejection', logUncaughtError);
