import assert from 'assert';

import { Credentials } from './types';

import { parseResponse, RequestUtils } from './util';

export async function testAuthenticationApi({
    sendRequest
}: RequestUtils, credentials: Credentials): Promise<void> {
    const makeRequest = (headers: Record<string, string> = {}) =>
        sendRequest({
            path: '/someUnknownRoute',
            method: 'POST',
            headers
        });

    assert.strictEqual(
        (await makeRequest()).statusCode,
        401,
        'unauthorized access is permitted'
    );

    const makeRequestWithToken = (token: string) =>
        makeRequest({ authorization: token });

    assert.strictEqual(
        (await makeRequestWithToken('token')).statusCode,
        403,
        'invalid token access is permitted'
    );

    assert.strictEqual((await sendRequest({
        path: '/login',
        method: 'POST',
        payload: { login: 'asd', password: 'psd' }
    })).statusCode, 403, 'login with incorrent credentials is permitted');

    const loginResponse = await sendRequest({
        path: '/login',
        method: 'POST',
        payload: credentials
    });
    assert.strictEqual(loginResponse.statusCode, 200, 'login attempt failed');

    const { token } = await parseResponse<{ token: string }>(loginResponse);

    assert.strictEqual(
        (await makeRequestWithToken(token)).statusCode,
        404,
        'access with obtained token is forbidden'
    );
}
