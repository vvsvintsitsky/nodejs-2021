import assert from 'assert';

import { findCommandLineArg } from '../src/utils/findCommandLineArg';

import { testAuthenticationApi } from './testAuthenticationApi';
import { testUserApi } from './testUserApi';
import { testGroupApi } from './testGroupApi';

import { RequestUtils, setupRequests } from './util';
import { Credentials } from './types';

interface E2EScenario {
    (requestUtils: RequestUtils, credentials: Credentials): Promise<void>;
}
const scenarios: E2EScenario[] = [testAuthenticationApi, testUserApi, testGroupApi];

const port = Number(findCommandLineArg('-p'));
const host = findCommandLineArg('-h') ?? '';
const login = findCommandLineArg('-login') ?? '';
const password = findCommandLineArg('-password') ?? '';

assert(port, 'missing port');
assert(host, 'missing host');
assert(login, 'missing login');
assert(password, 'missing password');

const requestUtils = setupRequests(host, port);

((async function runScenarios() {
    for (const scenario of scenarios) {
        await scenario(requestUtils, { login, password });
    }
}()).catch(error => console.log(error)));
