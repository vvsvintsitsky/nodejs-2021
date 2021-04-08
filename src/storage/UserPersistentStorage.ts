import { Knex } from 'knex';
import { User } from '../model/User';
import { UserStorage } from './types';

const TABLE_NAME = 'users';

export class UserPersistentStorage implements UserStorage {
    constructor(private connection: Knex) {}

    getById(id: string): Promise<User | undefined> {
        return this.connection(TABLE_NAME).where({ id }).first();
    }

    async update(id: string, user: User): Promise<void> {
        await this.connection(TABLE_NAME).update(user).where({ id });
    }

    async create(user: User): Promise<void> {
        await this.connection(TABLE_NAME).insert(user);
    }

    getAutoSuggestUsers(loginSubstring: string, limit: number): Promise<User[]> {
        return this.connection(TABLE_NAME).where('login', 'like', `%${loginSubstring}%`).limit(limit);
    }

    async markAsDeleted(id: string): Promise<void> {
        await this.connection(TABLE_NAME).update({ 'is_deleted': true }).where({ id });
    }
}
