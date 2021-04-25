import { Knex } from 'knex';

import { DataMapper } from '../data-mapper/types';
import { EntityNotFoundError } from '../error/EntityNotFoundError';
import { Group } from '../model/Group';
import { PersistentGroup } from './PersistentGroup';
import { StorageErrorParser } from './StorageErrorParser';

import { GroupStorage } from './GroupStorage';

const TABLE_NAME = 'groups';

export class GroupPersistentStorage implements GroupStorage {
    constructor(
      private connection: Knex,
      private groupMapper: DataMapper<Group, PersistentGroup>,
      private storageErrorParser: StorageErrorParser
    ) {}

    public async getById(id: string): Promise<Group> {
        const groups = await this.connection(TABLE_NAME).select().where({ id });

        this.assertUniqueUserOperationResult(id, groups.length);

        return this.groupMapper.fromPersistence(groups[0]);
    }

    public async create(group: Group): Promise<void> {
        await this.storageErrorParser.performUpdateOperation(() =>
            this.connection(TABLE_NAME).insert(this.groupMapper.toPersistence(group))
        );
    }

    public async getAll(): Promise<Group[]> {
        const groups = await this.connection(TABLE_NAME)
            .select();
        return groups.map((group) => this.groupMapper.fromPersistence(group));
    }

    public async delete(id: string): Promise<void> {
        await this.connection(TABLE_NAME).delete().where({ id });
    }

    public async update(
        groupId: string,
        group: Group
    ): Promise<void> {
        const { id, ...groupPart } = this.groupMapper.toPersistence(group);
        const updatedEntriesCount = await this.storageErrorParser.performUpdateOperation(
            () =>
                this.connection(TABLE_NAME)
                    .update(groupPart)
                    .where({ id })
        );

        this.assertUniqueUserOperationResult(groupId, updatedEntriesCount);
    }

    private assertUniqueUserOperationResult(id: string, entriesCount: number) {
        if (!entriesCount) {
            throw new EntityNotFoundError(`Group with ${id} id was not found`);
        }
    }
}
