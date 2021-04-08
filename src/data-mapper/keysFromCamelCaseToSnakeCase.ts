type Value = Record<string, unknown>;

export function keysFromCamelCaseToSnakeCase(
    value: Value,
    
): Value {
    return Object.keys(value).reduce((result: Value, key) => {
        result[camelToSnakeCase(key)] = value[key];
        return result;
    }, {});
}
