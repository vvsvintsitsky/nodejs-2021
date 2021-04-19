import assert from 'assert';
import { findCommandLineArg } from '../src/utils/findCommandLineArg';

import { testUserApi } from './testUserApi';

const port = Number(findCommandLineArg('-p'));
const host = findCommandLineArg('-h') ?? '';

assert(port, 'missing port');
assert(host, 'missing host');

testUserApi(host, port);
