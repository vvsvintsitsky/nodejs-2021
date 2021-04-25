import assert from 'assert';

import { v4 as uuid } from 'uuid';

import { setupRequests } from './util';

import { Permission } from '../src/model/Permission';
import { Group } from '../src/model/Group';

export async function testGroupApi(host: string, port?: number): Promise<void> {
    const { sendRequest, sendRequestAndParseResponse } = setupRequests(
        host,
        port
    );

    const createGroup = (group: Group) =>
        sendRequest({
            path: '/groups/create',
            method: 'POST',
            payload: group
        });

    const getGroup = (id: string) =>
        sendRequestAndParseResponse({ path: `/groups/group/${id}`, method: 'GET' });

    const mockGroups: Group[] = Array.from({ length: 3 }, (_, index) => {
        const id = uuid();
        return {
            id,
            name: `group_${index}_${id}`,
            permissions: [Permission.READ]
        };
    });

    await Promise.all(mockGroups.map(createGroup));
    assert.deepStrictEqual(
        await Promise.all(mockGroups.map((group) => getGroup(group.id))),
        mockGroups,
        'group data does not match'
    );

    const [defaultGroup, ...restGroups] = mockGroups;

    const updatedGroup: Group = {
        ...defaultGroup,
        name: `${defaultGroup.name}_updated`,
        permissions: [...defaultGroup.permissions, Permission.DELETE]
    };

    await sendRequest({
        path: `/groups/group/${defaultGroup.id}`,
        method: 'PUT',
        payload: updatedGroup
    });
    assert.deepStrictEqual(
        await getGroup(defaultGroup.id),
        updatedGroup,
        'group was not updated properly'
    );

    const allGroups = await sendRequestAndParseResponse({
        path: '/groups/all',
        method: 'GET'
    });
    assert.deepStrictEqual(
        allGroups,
        [updatedGroup, ...restGroups],
        'not all groups were returned'
    );

    const deleteResponse = await sendRequest({
        path: `/groups/group/${defaultGroup.id}`,
        method: 'DELETE'
    });
    assert.strictEqual(deleteResponse.statusCode, 200);
    const response = await sendRequest({
        path: `/groups/group/${defaultGroup.id}`,
        method: 'GET'
    });
    assert.strictEqual(response.statusCode, 404, 'group was not deleted');
}
