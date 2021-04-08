import { User } from '../model/User';
import { UserStorage } from '../storage/types';

export class UserService {
    constructor(private userStorage: UserStorage) {}

    public async getById(id: string): Promise<User | undefined> {
        return this.userStorage.getById(id);
    }

    public async getAutoSuggestUsers(loginSubstring: string, limit: number): Promise<User[]> {
        return this.userStorage.getAutoSuggestUsers(loginSubstring, limit);
    }

    public async create(user: User): Promise<void> {
        this.userStorage.create(user);
    }

    public async update(id: string, userPart: User): Promise<void> {
        this.userStorage.update(id, userPart);
    }

    public async markAsDeleted(id: string): Promise<void> {
        this.userStorage.markAsDeleted(id);
    }
}
