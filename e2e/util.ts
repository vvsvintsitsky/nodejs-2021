import { request, ClientRequest, IncomingMessage } from 'http';

const logResponse = (res: IncomingMessage) => {
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`Response: ${chunk}`);
    });
};

export const sendRequest = (req: ClientRequest): Promise<unknown> =>
    new Promise((resolve, reject) => {
        req.end();
        req.on('finish', () => resolve(req)).on('error', reject);
    });

interface RequestArgs {
    host: string;
    path: string;
    method: 'GET' | 'POST' | 'DELETE' | 'PUT';
    callback?: (res: IncomingMessage) => void;
    headers?: Record<string, string | number>;
    port: number;
}

interface JsomRequestArgs<T = unknown> extends RequestArgs {
  payload: T
}

export function makeRequest({
    host,
    path,
    method,
    callback = logResponse,
    headers,
    port
}: RequestArgs): ClientRequest {
    return request(
        {
            host,
            port,
            path,
            method,
            headers
        },
        callback
    ).on('error', () => console.log('err'));
}

export function makeJsonRequest<T>({
    payload,
    ...rest
}: JsomRequestArgs<T>): ClientRequest {
    const data = JSON.stringify(payload);
    const req = makeRequest({ headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }, ...rest });
    req.write(data);

    return req;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const setupRequests = (host: string, port: number) => ({
    request: (args: Omit<RequestArgs, 'port' | 'host'>) => makeRequest({ ...args, host, port }),
    jsonRequest: (args: Omit<JsomRequestArgs, 'port' | 'host'>) => makeJsonRequest({ ...args, host, port })
});
