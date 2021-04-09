import { CustomRequestError } from './CustomRequestError';

export class ConflictDataRequestError extends CustomRequestError {
    constructor() {
        super(422, 'This record conflicts with data in the database');
    }
}
