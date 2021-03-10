import { User } from "../model/User";

export interface UserStorage {
  getById(id: string): User | undefined;

  update(id: string, userPart: Partial<User>): void;

  create(user: User): void;

  getAutoSuggestUsers(loginSubstring: string, limit: number): User[];
}
