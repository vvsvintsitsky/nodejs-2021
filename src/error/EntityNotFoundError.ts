export class EntityNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = EntityNotFoundError.name;
        Error.captureStackTrace(this, EntityNotFoundError);
    }
}
