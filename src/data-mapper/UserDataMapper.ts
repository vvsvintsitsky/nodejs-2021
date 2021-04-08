import { User } from "../model/User";
import { DataMapper } from "./types";

type PersistenceUser = Omit<User, 'isDeleted'> & { is_deleted: boolean };

export class UserDataMapper implements DataMapper {
  toPersistence(value: User): PersistenceUser {
    return ;
  }
  fromPersistence(value: PersistenceUser): User {
    throw new Error("Method not implemented.");
  }
  
}