import assert from 'assert';

import { findCommandLineArg } from '../src/utils/findCommandLineArg';

import { testUserApi } from './testUserApi';
import { testGroupApi } from './testGroupApi';

const scenarios = [testUserApi, testGroupApi];

export function testApi(runScenario: (host: string, port: number) => Promise<void>): Promise<void> {
    const port = Number(findCommandLineArg('-p'));
    const host = findCommandLineArg('-h') ?? '';

    assert(port, 'missing port');
    assert(host, 'missing host');

    return runScenario(host, port);
}

(async function runScenarios() {
    for (const scenario of scenarios) {
        await testApi(scenario);
    }
}());
