export interface DataSourceConfig {
  url: string;
  pool: {
    minSize: number;
    maxSize: number;
  };
}

export interface TokenConfig {
  secret: string;
  expirationTime: number;
}
