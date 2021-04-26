import { v4 as uuid } from 'uuid';

import { Group } from '../src/model/Group';
import { Permission } from '../src/model/Permission';
import { User } from '../src/model/User';

export function createUsers(quantity: number): User[] {
    const loginPostfix = uuid();
    return Array.from({ length: quantity }, (_, index) => ({
        id: uuid(),
        age: 4,
        isDeleted: false,
        login: `login_${index}_${loginPostfix}`,
        password: 'a3aXsdq111zXX'
    }));
}

export function createGroups(quantity: number): Group[] {
    return Array.from({ length: quantity }, (_, index) => {
        const id = uuid();
        return {
            id,
            name: `group_${index}_${id}`,
            permissions: [Permission.UPLOAD_FILES]
        };
    });
}
