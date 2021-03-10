import { User } from "../model/User";
import { UserStorage } from "../storage/types";

export class UserService {
  constructor(private userStorage: UserStorage) {}

  getById(id: string) {
    return this.userStorage.getById(id);
  }

  markAsDeleted(id: string) {
    this.userStorage.update(id, { isDeleted: true });
  }

  getAutoSuggestUsers(loginSubstring: string, limit: number) {
    return this.userStorage.getAutoSuggestUsers(loginSubstring, limit);
  }

  create(user: User) {
    this.userStorage.create(user);
  }

  update(id: string, userPart: Partial<User>) {
    this.userStorage.update(id, userPart);
  }
}
