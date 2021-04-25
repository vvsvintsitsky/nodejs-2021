import { createSchemaValidator } from './createSchemaValidator';

import { NOT_EMPTY_STRING_PATTERN, UUID_PATTERN } from './patterns';

export const validateGroup = createSchemaValidator({
    type: 'object',
    properties: {
        id: { type: 'string', pattern: UUID_PATTERN },
        name: { type: 'string', pattern: NOT_EMPTY_STRING_PATTERN },
        permissions: {
            type: 'array'
        }
    },
    required: ['id', 'name', 'permissions']
});

export const validateGroupId = createSchemaValidator({
    type: 'object',
    properties: {
        id: { type: 'string', pattern: UUID_PATTERN }
    },
    required: ['id']
});
