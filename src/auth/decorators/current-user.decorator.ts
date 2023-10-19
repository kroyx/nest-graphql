import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../../users/entities';
import { Roles } from '../enums/roles.enum';

export const CurrentUser = createParamDecorator(
  (roles: Roles[] = [], context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const user: User = ctx.getContext().req.user;
    if (!user) {
      throw new InternalServerErrorException('No user inside the request');
    }
    if (roles.length === 0) return user;

    const isAuthorized = user.roles.some((role: Roles) => roles.includes(role));
    if (!isAuthorized) {
      throw new ForbiddenException(
        `User ${user.fullName} does not have enough privileges to execute the operation`,
      );
    }
    return user;
  },
);
