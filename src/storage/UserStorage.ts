import { User } from '../model/User';

export interface UserStorage {
  getById(id: string): Promise<User>;

  update(id: string, user: User): Promise<void>;

  create(user: User): Promise<void>;

  getAutoSuggestUsers(loginSubstring: string, limit: number): Promise<User[]>;

  markAsDeleted(id: string): Promise<void>;

  getByLoginAndPassword(login: string, password: string): Promise<User>;
}
