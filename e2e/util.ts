import { request, IncomingMessage, Server } from 'http';

import { Express } from 'express';
import { Credentials } from './types';

export function parseResponse<T = Record<string, unknown>>(res: IncomingMessage): Promise<T> {
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
}

export interface RequestArgs<T = unknown> {
  host: string;
  path: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  callback?: (res: IncomingMessage) => void;
  headers?: Record<string, string | number>;
  port?: number;
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

type StrippedRequestArgs = Omit<RequestArgs, 'port' | 'host'>;

interface RequestSender {
    (args: StrippedRequestArgs): Promise<IncomingMessage>
}

interface RequestSenderAndParser<T = unknown> {
    (args: StrippedRequestArgs): Promise<T>
}

export interface RequestUtils {
    sendRequest: RequestSender;
    sendRequestAndParseResponse: RequestSenderAndParser;
}

export function setupRequests(host: string, port?: number): RequestUtils {
    const sendRequest: RequestSender = args => makeRequest({ host, port, ...args });
    return {
        sendRequest,
        sendRequestAndParseResponse: args => sendRequest(args).then(parseResponse)
    };
}

export async function setupAuthenticatedRequests({
    sendRequest, sendRequestAndParseResponse
}: RequestUtils, credentials: Credentials): Promise<RequestUtils> {
    const loginResponse = await sendRequest({ path: '/login', method: 'POST', payload: credentials });
    const { token } = await parseResponse<{ token: string }>(loginResponse);

    function withAuthHeader<T>(requestSender: (args: StrippedRequestArgs) => T): (args: StrippedRequestArgs) => T {
        return ({ headers = {}, ...args }) => requestSender({ ...args, headers: { authorization: token, ...headers } });
    }

    const authenticatedRequestUtils: RequestUtils = {
        sendRequest: withAuthHeader(sendRequest),
        sendRequestAndParseResponse: withAuthHeader(sendRequestAndParseResponse)
    };

    return authenticatedRequestUtils;
}

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
