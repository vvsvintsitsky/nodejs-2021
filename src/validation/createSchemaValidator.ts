import Ajv, { Schema } from 'ajv';

import { Validator } from './types';

export function createSchemaValidator<P>(schema: Schema): Validator<P> {
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(schema);

    return function schemaValidator(data: P) {
        validate(data);
        return validate.errors;
    };
}
