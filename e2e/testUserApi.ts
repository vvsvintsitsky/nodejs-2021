import assert from 'assert';

import { v4 as uuid } from 'uuid';

import { RequestUtils, setupAuthenticatedRequests } from './util';

import { User } from '../src/model/User';
import { createUsers } from './mockDataUtils';
import { Credentials } from './types';

const mockUsers = createUsers(3);

const [defaultUser, ...restUsers] = mockUsers;
defaultUser.login = `login_${uuid()}`;

export async function testUserApi(requestUtils: RequestUtils, credentials: Credentials): Promise<void> {
    const { sendRequest, sendRequestAndParseResponse } = await setupAuthenticatedRequests(requestUtils, credentials);

    const createUser = (user: User) =>
        sendRequest({
            path: '/users/create',
            method: 'POST',
            payload: user
        });

    const getUser = (id: string) =>
        sendRequestAndParseResponse({ path: `/users/user/${id}`, method: 'GET' });

    const createUserResponses = await Promise.all(mockUsers.map(createUser));
    assert.strictEqual(
        createUserResponses.every((res) => res.statusCode === 201),
        true,
        'not all users were created'
    );
    assert.deepStrictEqual(
        await Promise.all(mockUsers.map((user) => getUser(user.id))),
        mockUsers,
        'user data does not match'
    );

    const updatedUser = {
        ...defaultUser,
        age: defaultUser.age + 20
    };
    await sendRequest({
        path: `/users/user/${defaultUser.id}`,
        method: 'PUT',
        payload: updatedUser
    });
    assert.deepStrictEqual(
        await getUser(defaultUser.id),
        updatedUser,
        'user was not updated properly'
    );

    const suggestedUsers = await sendRequestAndParseResponse({
        path: '/users/autoSuggest',
        method: 'POST',
        payload: { limit: 10, loginPart: restUsers[0].login.substr(10, 15) }
    });
    assert.deepStrictEqual(
        suggestedUsers,
        restUsers,
        'not all users were suggested'
    );

    const deleteResponse = await sendRequest({
        path: `/users/user/${defaultUser.id}`,
        method: 'DELETE'
    });
    assert.strictEqual(deleteResponse.statusCode, 200);
    const response = await sendRequest({
        path: `/users/user/${defaultUser.id}`,
        method: 'GET'
    });
    assert.strictEqual(response.statusCode, 404, 'user was not deleted');
}
