type Value = Record<string, unknown>;

export function keysFromUpperCaseToSnakeCase(
    value: Value
): Value {
    const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    return Object.keys(value).reduce((result: Value, key) => {
        result[camelToSnakeCase(key)] = value[key];
        return result;
    }, {});
}
