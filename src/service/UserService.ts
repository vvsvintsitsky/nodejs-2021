import { User } from '../model/User';
import { UserStorage } from '../storage/UserStorage';

export class UserService {
    constructor(private userStorage: UserStorage) {}

    public getById(id: string): Promise<User> {
        return this.userStorage.getById(id);
    }

    public getAutoSuggestUsers(loginSubstring: string, limit: number): Promise<User[]> {
        return this.userStorage.getAutoSuggestUsers(loginSubstring, limit);
    }

    public create(user: User): Promise<void> {
        return this.userStorage.create(user);
    }

    public update(id: string, userPart: User): Promise<void> {
        return this.userStorage.update(id, userPart);
    }

    public markAsDeleted(id: string): Promise<void> {
        return this.userStorage.markAsDeleted(id);
    }
}
