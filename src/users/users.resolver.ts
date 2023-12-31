import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import {
  Args,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/enums/roles.enum';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { PaginationArgs, SearchArgs } from '../common/dto/args';
import { Item } from '../items/entities';
import { ItemsService } from '../items/items.service';
import { List } from '../lists/entities/list.entity';
import { ListsService } from '../lists/lists.service';
import { UpdateUserInput } from './dto';
import { RolesArgs } from './dto/args/roles.args';
import { User } from './entities';
import { UsersService } from './users.service';

@Resolver(() => User)
@UseGuards(GqlJwtAuthGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListsService,
  ) {}

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

  @ResolveField(() => Int, { name: 'itemCount' })
  async itemCount(
    @CurrentUser([Roles.ADMIN]) adminUser: User,
    @Parent() user: User,
  ): Promise<number> {
    return this.itemsService.getItemsCount(user);
  }

  @ResolveField(() => [Item], { name: 'items' })
  async getItemsByUser(
    @CurrentUser([Roles.ADMIN]) adminUser: User,
    @Parent() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<Item[]> {
    return this.itemsService.findAll(user, paginationArgs, searchArgs);
  }

  @ResolveField(() => Int, { name: 'listsCount' })
  async listsCount(
    @CurrentUser() adminUser: User,
    @Parent() user: User,
  ): Promise<number> {
    return this.listsService.getListsCount(user);
  }

  @ResolveField(() => [List], { name: 'lists' })
  async getListsByUser(
    @CurrentUser([Roles.ADMIN]) adminUser: User,
    @Parent() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<List[]> {
    return this.listsService.findAll(user, paginationArgs, searchArgs);
  }
}
