import { Group } from '../model/Group';

export interface GroupStorage {
  getById(id: string): Promise<Group>;

  getAll(): Promise<Group[]>;

  update(id: string, group: Group): Promise<void>;

  create(group: Group): Promise<void>;

  delete(id: string): Promise<void>;
}
