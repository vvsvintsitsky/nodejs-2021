export class UniqueConstraintViolationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = UniqueConstraintViolationError.name;
        Error.captureStackTrace(this, UniqueConstraintViolationError);
    }
}
