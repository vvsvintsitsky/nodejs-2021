import { User } from '../model/User';
import { PersistentUser } from '../storage/PersistentUser';
import { DataMapper } from './types';

export class UserDataMapper
implements
    DataMapper<User, PersistentUser> {
    toPersistence({
        isDeleted,
        ...rest
    }: User): PersistentUser {
        return { is_deleted: isDeleted, ...rest };
    }

    fromPersistence({
        is_deleted,
        ...rest
    }:PersistentUser): User {
        return { isDeleted: is_deleted, ...rest };
    }
}
