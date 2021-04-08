import { EntityAlreadyExistsError } from '../error/EntityAlreadyExistsError';
import { EntityNotFoundError } from '../error/EntityNotFoundError';
import { User } from '../model/User';

import { UserStorage } from './types';

const isActivedUser = (user: User) => !user.isDeleted;

export class InMemoryUserStorage implements UserStorage {
  private users: User[] = [];

  public async getById(id: string): Promise<User | undefined> {
      return this.users.find((user) => user.id === id && isActivedUser(user));
  }

  public async update(id: string, userToUpdate: User): Promise<void> {
      const user = this.getById(id);

      if (!user) {
          throw new EntityNotFoundError(`User with ${id} id was not found`);
      }

      Object.assign(user, userToUpdate);
  }

  public async create(user: User): Promise<void> {
      if (this.users.find((existingUser) => existingUser.id === user.id)) {
          throw new EntityAlreadyExistsError(
              `User with id '${user.id}' already exists`
          );
      }

      this.users.push(user);
  }

  public async getAutoSuggestUsers(loginSubstring: string, limit: number): Promise<User[]> {
      return this.users
          .filter(isActivedUser)
          .filter((user) => user.login.includes(loginSubstring))
          .sort((left, right) => left.login.localeCompare(right.login))
          .slice(0, limit);
  }

  public async markAsDeleted(id: string): Promise<void> {
      const user = await this.getById(id);

      if (user) {
          user.isDeleted = true;
      }
  }
}
