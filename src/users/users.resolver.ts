import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/enums/roles.enum';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { UpdateUserInput } from './dto';
import { RolesArgs } from './dto/args/roles.args';
import { User } from './entities';
import { UsersService } from './users.service';

@Resolver(() => User)
@UseGuards(GqlJwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  findAll(
    @Args() rolesArgs: RolesArgs,
    @CurrentUser([Roles.ADMIN]) user: User,
  ): Promise<User[]> {
    return this.usersService.findAll(rolesArgs.roles);
  }

  @Query(() => User, { name: 'user' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([Roles.ADMIN]) user: User,
  ): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User, { name: 'blockUser' })
  blockUser(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser([Roles.ADMIN]) user: User,
  ): Promise<User> {
    return this.usersService.block(id, user);
  }

  @Mutation(() => User, { name: 'updateUser' })
  updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser([Roles.ADMIN]) user: User,
  ): Promise<User> {
    return this.usersService.updateUser(updateUserInput, user);
  }
}
