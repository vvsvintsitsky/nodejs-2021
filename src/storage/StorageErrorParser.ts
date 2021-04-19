export interface StorageErrorParser {
  performUpdateOperation<T>(operation: () => Promise<T>): Promise<T>;
}
