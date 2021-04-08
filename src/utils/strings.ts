export function camelCaseToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function snakeCaseToCamelCase(str: string): string {
    return str
        .toLowerCase()
        .replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('_', ''));
}
