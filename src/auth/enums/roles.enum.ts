import { registerEnumType } from '@nestjs/graphql';

export enum Roles {
  ADMIN = 'admin',
  USER = 'user',
  SUPER_USER = 'super_user',
}

registerEnumType(Roles, { name: 'Roles' });
