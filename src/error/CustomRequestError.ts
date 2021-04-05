export class CustomRequestError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = CustomRequestError.name;
        Error.captureStackTrace(this, CustomRequestError);
    }
}
