import { Permission } from './Permission';

export interface Group {
  id: string;
  name: string;
  permissions: Permission[];
}
