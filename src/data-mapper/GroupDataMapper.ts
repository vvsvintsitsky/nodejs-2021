/* eslint-disable no-bitwise */
import { Group } from '../model/Group';
import { Permission } from '../model/Permission';

import { PersistentGroup } from '../storage/PersistentGroup';

import { DataMapper } from './types';

const PersistentPermission: Record<Permission, number> = {
    [Permission.READ]: 0b00000001,
    [Permission.WRITE]: 0b00000010,
    [Permission.DELETE]: 0b00000100,
    [Permission.SHARE]: 0b00001000,
    [Permission.UPLOAD_FILES]: 0b00010000
};

const PersistentToModel = new Map<number, Permission>([
    [PersistentPermission.READ, Permission.READ],
    [PersistentPermission.WRITE, Permission.WRITE],
    [PersistentPermission.DELETE, Permission.DELETE],
    [PersistentPermission.SHARE, Permission.SHARE],
    [PersistentPermission.UPLOAD_FILES, Permission.UPLOAD_FILES]
]);

export class GroupDataMapper implements DataMapper<Group, PersistentGroup> {
    toPersistence({ permissions, ...rest }: Group): PersistentGroup {
        const persistencePermissions = permissions.reduce(
            (result, permission) =>
                result | PersistentPermission[permission],
            0b0
        );
        return { permissions: persistencePermissions, ...rest };
    }

    fromPersistence({ permissions, ...rest }: PersistentGroup): Group {
        const modelPermissions: Permission[] = Object
            .values(PersistentPermission)
            .reduce((result: Permission[], value: number) => {
                const modelValue = PersistentToModel.get(value & permissions);

                if (modelValue) {
                    result.push(modelValue);
                }

                return result;
            }, []);

        return { permissions: modelPermissions, ...rest };
    }
}
