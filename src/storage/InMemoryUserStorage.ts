import { User } from '../model/User';

import { UserStorage } from './types';

const isActivedUser = (user: User) => !user.isDeleted;

export class InMemoryUserStorage implements UserStorage {
  private users: User[] = [];

  public getById(id: string): User | undefined {
      return this.users.find((user) => user.id === id && isActivedUser(user));
  }

  public update(id: string, userToUpdate: User): void {
      const user = this.getById(id);

      if (!user) {
          throw new Error(`User with ${id} id was not found`);
      }

      Object.assign(user, userToUpdate);
  }

  public create(user: User): void {
      if (this.users.find((existingUser) => existingUser.id === user.id)) {
          throw new Error(`User with id '${user.id}' already exists`);
      }

      this.users.push(user);
  }

  public getAutoSuggestUsers(loginSubstring: string, limit: number): User[] {
      return this.users
          .filter(isActivedUser)
          .filter((user) => user.login.includes(loginSubstring))
          .sort((left, right) => left.login.localeCompare(right.login))
          .slice(0, limit);
  }

  public markAsDeleted(id: string): void {
      const user = this.getById(id);

      if (user) {
          user.isDeleted = true;
      }
  }
}
