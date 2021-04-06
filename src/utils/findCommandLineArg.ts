export function findCommandLineArg(
    argumentName: string,
    argv = process.argv
): string | undefined {
    return argv.find((_, index, arr) => arr[index - 1] === argumentName);
}
