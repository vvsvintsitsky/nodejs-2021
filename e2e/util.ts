import { request, IncomingMessage } from 'http';

export const logResponse = (res: IncomingMessage): void => {
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`Response: ${chunk}`);
    });
};

interface RequestArgs<T = unknown> {
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
