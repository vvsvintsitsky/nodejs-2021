import { Group } from '../model/Group';

export type PersistentGroup = Omit<Group, 'permissions'> & {
  permissions: number;
};
