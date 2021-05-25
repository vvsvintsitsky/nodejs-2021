import { Knex } from 'knex';

import { DataMapper } from '../data-mapper/types';
import { EntityNotFoundError } from '../error/EntityNotFoundError';
import { User } from '../model/User';
import { PersistentUser } from './PersistentUser';
import { StorageErrorParser } from './StorageErrorParser';

import { UserStorage } from './UserStorage';

const TABLE_NAME = 'users';

export class UserPersistentStorage implements UserStorage {
    constructor(
        private connection: Knex,
        private userMapper: DataMapper<User, PersistentUser>,
        private storageErrorParser: StorageErrorParser
    ) {}

    public async getById(id: string): Promise<User> {
        const users = await this.connection(TABLE_NAME).select().where(
            this.getActiveUserPredicate({ id })
        );

        this.assertUniqueUserOperationResult(id, users.length);

        return this.userMapper.fromPersistence(users[0]);
    }

    public update(id: string, user: User): Promise<void> {
        return this.updateUser(id, this.userMapper.toPersistence(user));
    }

    public create(user: User): Promise<void> {
        return this.storageErrorParser.performUpdateOperation(() =>
            this.connection(TABLE_NAME).insert(this.userMapper.toPersistence(user))
        );
    }

    public async getAutoSuggestUsers(
        loginSubstring: string,
        limit: number
    ): Promise<User[]> {
        const users = await this.connection(TABLE_NAME)
            .select()
            .where(this.getActiveUserPredicate())
            .andWhere('login', 'like', `%${loginSubstring}%`)
            .orderBy('login', 'asc')
            .limit(limit);
        return users.map((user) => this.userMapper.fromPersistence(user));
    }

    public markAsDeleted(id: string): Promise<void> {
        return this.updateUser(id, { is_deleted: true });
    }

    public async getByLoginAndPassword(login: string, password: string): Promise<User> {
        const [user] = await this.connection(TABLE_NAME).select().where(
            this.getActiveUserPredicate({ login, password })
        );

        if (!user) {
            throw new EntityNotFoundError('User with specified credentials was not found');
        }

        return this.userMapper.fromPersistence(user);
    }

    private assertUniqueUserOperationResult(id: string, entriesCount: number) {
        if (!entriesCount) {
            throw new EntityNotFoundError(`User with ${id} id was not found`);
        }
    }

    private getActiveUserPredicate(userPredicate: Partial<PersistentUser> = {}) {
        return { ...userPredicate, is_deleted: false };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private async updateUser(userId: string, { id, ...userPart }: Partial<PersistentUser>) {
        const updatedEntriesCount = await this.storageErrorParser.performUpdateOperation(
            () =>
                this.connection(TABLE_NAME)
                    .update(userPart)
                    .where(this.getActiveUserPredicate({ id: userId }))
        );

        this.assertUniqueUserOperationResult(userId, updatedEntriesCount);
    }
}
