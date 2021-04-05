import { request, IncomingMessage, Server } from 'http';
import { Express } from 'express';

export const parseResponse = (res: IncomingMessage): Promise<string> => {
    return new Promise((resolve) => {
        res.setEncoding('utf8');
        let responseBody = '';
        res.on('data', (chunk) => {
            responseBody += chunk;
        });
        res.on('end', () => {
            resolve(JSON.parse(responseBody));
        });
    });
};

export interface RequestArgs<T = unknown> {
  host: string;
  path: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  callback?: (res: IncomingMessage) => void;
  headers?: Record<string, string | number>;
  port: number;
  payload?: T;
}

export function makeRequest({
    host,
    path,
    method,
    headers,
    port,
    payload
}: RequestArgs): Promise<IncomingMessage> {
    return new Promise((resolve, reject) => {
        let extendedHeaders = headers;
        const data = payload ? JSON.stringify(payload) : undefined;

        if (data) {
            extendedHeaders = {
                ...extendedHeaders,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            };
        }

        const req = request(
            {
                host,
                port,
                path,
                method,
                headers: extendedHeaders
            },
            (res) => resolve(res)
        ).on('error', reject);

        if (data) {
            req.write(data);
        }

        req.end();
    });
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const setupRequests = (host: string, port: number) => (
    args: Omit<RequestArgs, 'port' | 'host'>
) => makeRequest({ ...args, host, port });

interface ServerHandle {
  server?: Server;
}

export const startServer = (
    port: number,
    app: Express
): [ServerHandle, Promise<void>] => {
    const handle: ServerHandle = {};
    return [
        handle,
        new Promise((resolve) => {
            handle.server = app.listen(port, () => resolve(undefined));
        })
    ];
};
