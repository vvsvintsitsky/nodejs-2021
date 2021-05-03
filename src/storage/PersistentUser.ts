import { User } from '../model/User';

export type PersistentUser = Omit<User, 'isDeleted'> & { is_deleted: boolean };
