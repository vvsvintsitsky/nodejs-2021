import Ajv, { Schema } from "ajv";

export function createSchemaValidator(schema: Schema) {
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);

  return function schemaValidator(data: Record<string, any>) {
    validate(data);
    return validate.errors;
  }
}
