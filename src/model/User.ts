export interface User {
  id: string;
  login: string;
  password: string;
  age: number;
  isDeleted: boolean;
}

export type PersistentUser = Omit<User, 'isDeleted'> & { is_deleted: boolean };
