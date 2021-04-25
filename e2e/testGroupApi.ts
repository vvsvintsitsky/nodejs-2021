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

    const sortGroupsById = (groups: Group[]) =>
        groups.concat().sort((left, right) => left.id.localeCompare(right.id));

    const sortGroupPermissions = (group: Group): Group => ({
        ...group,
        permissions: group.permissions.concat().sort()
    });

    const mockGroups: Group[] = sortGroupsById(
        Array.from({ length: 3 }, (_, index) => {
            const id = uuid();
            return {
                id,
                name: `group_${index}_${id}`,
                permissions: [Permission.UPLOAD_FILES]
            };
        }).map(sortGroupPermissions)
    );

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
    assert.strictEqual(deleteResponse.statusCode, 200);
    const response = await sendRequest({
        path: `/groups/group/${defaultGroup.id}`,
        method: 'GET'
    });
    assert.strictEqual(response.statusCode, 404, 'group was not deleted');
}
