import { Knex } from 'knex';
import { DataMapper } from '../data-mapper/types';
import { PersistentUser, User } from '../model/User';
import { UserStorage } from './types';

const TABLE_NAME = 'users';

export class UserPersistentStorage implements UserStorage {
    constructor(private connection: Knex, private userMapper: DataMapper<User, PersistentUser>) {}

    public async getById(id: string): Promise<User | undefined> {
        const user = await this.connection(TABLE_NAME).where({ id }).first();
        return this.userMapper.fromPersistence(user);
    }

    public async update(id: string, user: User): Promise<void> {
        await this.connection(TABLE_NAME).update(user).where({ id });
    }

    public async create(user: User): Promise<void> {
        await this.connection(TABLE_NAME).insert(this.userMapper.toPersistence(user));
    }

    public async getAutoSuggestUsers(loginSubstring: string, limit: number): Promise<User[]> {
        const users = await this.connection(TABLE_NAME)
            .where('login', 'like', `%${loginSubstring}%`)
            .limit(limit);
        return users.map(user => this.userMapper.fromPersistence(user));
    }

    public async markAsDeleted(id: string): Promise<void> {
        await this.connection(TABLE_NAME)
            .update({ is_deleted: true })
            .where({ id });
    }
}
