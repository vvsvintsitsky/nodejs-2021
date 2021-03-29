import { createSchemaValidator } from "./createSchemaValidator";

const NOT_EMPTY_STRING_PATTERN = "^(?!s*$).+";

export const validateUser = createSchemaValidator({
  type: "object",
  properties: {
    id: { type: "string", pattern: NOT_EMPTY_STRING_PATTERN },
    login: { type: "string", pattern: NOT_EMPTY_STRING_PATTERN },
    password: {
      type: "string",
      pattern: "^(?=.*d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$",
    },
    age: { type: "integer", minimum: 3, maximum: 120 },
    isDeleted: { type: "boolean" },
  },
  required: ["id", "login", "password", "age", "isDeleted"],
});

export const validateUserId = createSchemaValidator({
  type: "object",
  properties: {
    id: { type: "string", pattern: NOT_EMPTY_STRING_PATTERN },
  },
  required: ["id"],
});

export const validateAutosuggest = createSchemaValidator({
  type: "object",
  properties: {
    loginPart: { type: "string", pattern: NOT_EMPTY_STRING_PATTERN },
    limit: { type: "integer", minimum: 1, maximum: 100 },
  },
  required: ["loginPart", "limit"],
});
