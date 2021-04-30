import { Request as ExpressRequest } from 'express';

import { Logger } from './Logger';

export type Request = ExpressRequest;

export class RequestLogger {
    constructor(private readonly logger: Logger) {}

    error(message: string, request: Request): void {
        this.log('error', message, request);
    }

    warn(message: string, request: Request): void {
        this.log('warn', message, request);
    }

    info(message: string, request: Request): void {
        this.log('info', message, request);
    }

    debug(message: string, request: Request): void {
        this.log('debug', message, request);
    }

    private getRequestMeta({ path, params, method }: Request) {
        return { path, params, method };
    }

    private log(key: keyof Logger, message: string, request: Request) {
        this.logger[key](message, this.getRequestMeta(request));
    }
}
