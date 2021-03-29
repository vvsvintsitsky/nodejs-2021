import assert from 'assert';

import { setupRequests, startServer, parseResponse, RequestArgs } from './util';

import { User } from '../src/model/User';
import { UserService } from '../src/service/UserService';
import { createApplication } from '../src/createApplication';
import { InMemoryUserStorage } from '../src/storage/InMemoryUserStorage';

const PORT = 4000;

const sendRequest = setupRequests('localhost', PORT);
const sendRequestAndParseResponse = (
    args: Omit<RequestArgs, 'host' | 'port'>
) => sendRequest(args).then(parseResponse);

const createUser = (user: User) =>
    sendRequest({
        path: '/users/create',
        method: 'POST',
        payload: user
    });

const getUser = (id: string) =>
    sendRequestAndParseResponse({ path: `/users/user/${id}`, method: 'GET' });

const [handle, serverStartPromise] = startServer(
    PORT,
    createApplication(new UserService(new InMemoryUserStorage()))
);

async function testUserApi() {
    const mockUsers: User[] = Array.from({ length: 3 }, (_: unknown, index) => ({
        id: `${index}`,
        age: 4,
        isDeleted: false,
        login: 'autoSuggest',
        password: 'a3aXsdq111zXX'
    }));

    const [defaultUser, ...restUsers] = mockUsers;
    defaultUser.login = 'xxx';

    await Promise.all(mockUsers.map(createUser));
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
        payload: { limit: 10, loginPart: restUsers[0].login.substr(0, 2) }
    });
    assert.deepStrictEqual(
        suggestedUsers,
        restUsers,
        'not all users were suggested'
    );

    await sendRequest({
        path: `/users/user/${defaultUser.id}`,
        method: 'DELETE'
    });
    const response = await sendRequest({
        path: `/users/user/${defaultUser.id}`,
        method: 'GET'
    });
    assert.strictEqual(response.statusCode, 404, 'user was not deleted');
}

serverStartPromise.then(testUserApi).finally(() => handle.server?.close());
