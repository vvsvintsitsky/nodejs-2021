import assert from 'assert';

import { findCommandLineArg } from '../src/utils/findCommandLineArg';

import { testUserApi } from './testUserApi';
import { testGroupApi } from './testGroupApi';
import { setupRequests } from './util';

const scenarios = [testUserApi, testGroupApi];

const port = Number(findCommandLineArg('-p'));
const host = findCommandLineArg('-h') ?? '';

assert(port, 'missing port');
assert(host, 'missing host');

const requestUtils = setupRequests(host, port);

((async function runScenarios() {
    for (const scenario of scenarios) {
        await scenario(requestUtils);
    }
}()).catch(error => console.log(error)));
