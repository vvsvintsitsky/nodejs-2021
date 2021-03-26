import { User } from "../model/User";
import { UserStorage } from "../storage/types";

export class UserService {
  constructor(private userStorage: UserStorage) {}

  public getById(id: string) {
    return this.userStorage.getById(id);
  }

  public getAutoSuggestUsers(loginSubstring: string, limit: number) {
    return this.userStorage.getAutoSuggestUsers(loginSubstring, limit);
  }

  public create(user: User) {
    this.userStorage.create(user);
  }

  public update(id: string, userPart: User) {
    this.userStorage.update(id, userPart);
  }

  public markAsDeleted(id: string) {
    this.userStorage.markAsDeleted(id);
  }
}
