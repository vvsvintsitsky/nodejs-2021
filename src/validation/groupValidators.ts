import { Permission } from '../model/Permission';

import { createSchemaValidator } from './createSchemaValidator';

import { NOT_EMPTY_STRING_PATTERN, UUID_PATTERN } from './patterns';

const UUID_DESCRIPTOR = { type: 'string', pattern: UUID_PATTERN };

export const validateGroup = createSchemaValidator({
    type: 'object',
    properties: {
        id: UUID_DESCRIPTOR,
        name: { type: 'string', pattern: NOT_EMPTY_STRING_PATTERN },
        permissions: {
            type: 'array',
            items: {
                type: 'string',
                enum: Object.values(Permission)
            }
        }
    },
    required: ['id', 'name', 'permissions']
});

export const validateGroupId = createSchemaValidator({
    type: 'object',
    properties: {
        id: UUID_DESCRIPTOR
    },
    required: ['id']
});

export const validateGroupIdAndUserIds = createSchemaValidator({
    type: 'object',
    properties: {
        groupId: UUID_DESCRIPTOR,
        userIds: {
            type: 'array',
            items: UUID_DESCRIPTOR,
            minItems: 1
        }
    },
    required: ['groupId', 'userIds']
});
