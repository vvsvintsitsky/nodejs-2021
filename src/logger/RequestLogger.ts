import { Request as ExpressRequest } from 'express';

import { Logger } from './Logger';

export type Request = ExpressRequest;
type Meta = Record<string, unknown>;

export class RequestLogger {
    constructor(private readonly logger: Logger) {}

    error(message: string, request: Request, meta?: Meta): void {
        this.log('error', message, request, meta);
    }

    warn(message: string, request: Request, meta?: Meta): void {
        this.log('warn', message, request, meta);
    }

    info(message: string, request: Request, meta?: Meta): void {
        this.log('info', message, request, meta);
    }

    debug(message: string, request: Request, meta?: Meta): void {
        this.log('debug', message, request, meta);
    }

    private getRequestMeta({ path, params, method }: Request) {
        return { path, params, method };
    }

    private log(key: keyof Logger, message: string, request: Request, meta: Meta = {}) {
        this.logger[key](message, { ...meta, ...this.getRequestMeta(request) });
    }
}
