import { Permission } from '../model/Permission';

import { createSchemaValidator } from './createSchemaValidator';

import { NOT_EMPTY_STRING_PATTERN, UUID_PATTERN } from './patterns';

export const validateGroup = createSchemaValidator({
    type: 'object',
    properties: {
        id: { type: 'string', pattern: UUID_PATTERN },
        name: { type: 'string', pattern: NOT_EMPTY_STRING_PATTERN },
        permissions: {
            enum : Object.values(Permission)
        }
    },
    required: ['id', 'name', 'permission']
});

export const validateGroupId = createSchemaValidator({
    type: 'object',
    properties: {
        id: { type: 'string', pattern: UUID_PATTERN }
    },
    required: ['id']
});
