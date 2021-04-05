import { User } from '../model/User';
import { UserStorage } from '../storage/types';

export class UserService {
    constructor(private userStorage: UserStorage) {}

    public getById(id: string): User | undefined {
        return this.userStorage.getById(id);
    }

    public getAutoSuggestUsers(loginSubstring: string, limit: number): User[] {
        return this.userStorage.getAutoSuggestUsers(loginSubstring, limit);
    }

    public create(user: User): void {
        this.userStorage.create(user);
    }

    public update(id: string, userPart: User): void {
        this.userStorage.update(id, userPart);
    }

    public markAsDeleted(id: string): void {
        this.userStorage.markAsDeleted(id);
    }
}
