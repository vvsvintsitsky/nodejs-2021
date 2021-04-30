export interface LogMethod {
  (message: string, meta?: Record<string, unknown>): void;
}

export interface Logger {
  error: LogMethod;
  info: LogMethod;
  debug: LogMethod;
  warn: LogMethod;
}
