import { UniqueConstraintViolationError } from '../error/UniqueConstraintViolationError';
import { StorageErrorParser } from './StorageErrorParser';

const UNIQUE_CONSTRAINT_VOILATION_CODE = '23505';

export class PostgresStorageErrorParser implements StorageErrorParser {
    public async performUpdateOperation<T>(
        operation: () => Promise<T>
    ): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            if (error.code === UNIQUE_CONSTRAINT_VOILATION_CODE) {
                throw new UniqueConstraintViolationError(error.message);
            }
            throw error;
        }
    }
}
