import { Group } from '../model/Group';
import { GroupStorage } from '../storage/GroupStorage';

export class GroupService {
    constructor(private groupStorage: GroupStorage) {}

    public getById(id: string): Promise<Group> {
        return this.groupStorage.getById(id);
    }

    public getAll(): Promise<Group[]> {
        return this.groupStorage.getAll();
    }

    public create(group: Group): Promise<void> {
        return this.groupStorage.create(group);
    }

    public update(id: string, group: Group): Promise<void> {
        return this.groupStorage.update(id, group);
    }

    public delete(id: string): Promise<void> {
        return this.groupStorage.delete(id);
    }

    public addUsersToGroup(groupId: string, userIds: string[]): Promise<void> {
        return this.groupStorage.addUsersToGroup(groupId, userIds);
    }
}
