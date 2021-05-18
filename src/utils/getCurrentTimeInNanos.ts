export function getCurrentTimeInNanos(): bigint {
    return process.hrtime.bigint();
}
