import { User } from "../model/User";

import { UserStorage } from "./types";

export class InMemoryUserStorage implements UserStorage {
  private users: User[] = [];

  public getById(id: string) {
    return this.users.find((user) => user.id === id);
  }

  public update(id: string, userPart: Partial<User>) {
    const user = this.getById(id);

    if (!user) {
      throw new Error(`User with ${id} id was not found`);
    }

    Object.assign(user, userPart);
  }

  public create(user: User) {
    this.users.push(user);
  }

  public getAutoSuggestUsers(loginSubstring: string, limit: number) {
    return this.users
      .filter((user) => user.login.includes(loginSubstring))
      .sort((left, right) => left.login.localeCompare(right.login))
      .slice(0, limit);
  }
}
