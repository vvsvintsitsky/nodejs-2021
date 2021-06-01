import assert from 'assert';

import { Permission } from '../src/model/Permission';
import { Group } from '../src/model/Group';
import { User } from '../src/model/User';

import { RequestUtils, setupAuthenticatedRequests } from './util';

import { createGroups, createUsers } from './mockDataUtils';
import { Credentials } from './types';

const sortGroupsById = (groups: Group[]) =>
    groups.concat().sort((left, right) => left.id.localeCompare(right.id));

const sortGroupPermissions = (group: Group): Group => ({
    ...group,
    permissions: group.permissions.concat().sort()
});

const mockGroups = sortGroupsById(
    createGroups(3).map(sortGroupPermissions)
);

const mockUsers = createUsers(2);

export async function testGroupApi(requestUtils: RequestUtils, credentials: Credentials): Promise<void> {
    const { sendRequest, sendRequestAndParseResponse } = await setupAuthenticatedRequests(requestUtils, credentials);

    const createGroup = (group: Group) =>
        sendRequest({
            path: '/groups/create',
            method: 'POST',
            payload: group
        });

    const getGroup = (id: string) =>
        sendRequestAndParseResponse({ path: `/groups/group/${id}`, method: 'GET' });

    const createGroupResponses = await Promise.all(mockGroups.map(createGroup));
    assert.deepStrictEqual(
        createGroupResponses.every((res) => res.statusCode === 201),
        true,
        'not all groups were created'
    );
    assert.deepStrictEqual(
        await Promise.all(mockGroups.map((group) => getGroup(group.id))),
        mockGroups,
        'group data does not match'
    );

    const [defaultGroup, ...restGroups] = mockGroups;

    const updatedGroup: Group = sortGroupPermissions({
        ...defaultGroup,
        name: `${defaultGroup.name}_updated`,
        permissions: [...defaultGroup.permissions, Permission.DELETE]
    });

    await sendRequest({
        path: `/groups/group/${updatedGroup.id}`,
        method: 'PUT',
        payload: updatedGroup
    });

    const receivedUpdatedGroup = sortGroupPermissions(
    (await getGroup(updatedGroup.id)) as Group
    );
    assert.deepStrictEqual(
        receivedUpdatedGroup,
        updatedGroup,
        'group was not updated properly'
    );

    const allGroups = sortGroupsById(
    (await sendRequestAndParseResponse({
        path: '/groups/all',
        method: 'GET'
    })) as Group[]
    );
    assert.deepStrictEqual(
        allGroups.map(sortGroupPermissions),
        [receivedUpdatedGroup, ...restGroups],
        'not all groups were returned'
    );

    const deleteResponse = await sendRequest({
        path: `/groups/group/${defaultGroup.id}`,
        method: 'DELETE'
    });
    assert.strictEqual(deleteResponse.statusCode, 200, 'group was not deleted');
    const getGroupResponse = await sendRequest({
        path: `/groups/group/${defaultGroup.id}`,
        method: 'GET'
    });
    assert.strictEqual(getGroupResponse.statusCode, 404, 'deleted group was found');

    const createUser = (user: User) =>
        sendRequest({
            path: '/users/create',
            method: 'POST',
            payload: user
        });
    await Promise.all(mockUsers.map(createUser));

    assert.strictEqual((await sendRequest({
        path: '/groups/addUsers',
        method: 'POST',
        payload: {
            groupId: restGroups[0].id,
            userIds: mockUsers.map(user => user.id)
        }
    })).statusCode, 201, 'users were not added to group');
}
