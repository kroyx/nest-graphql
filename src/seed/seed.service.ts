import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationArgs, SearchArgs } from '../common/dto/args';
import { CreateItemInput } from '../items/dto';
import { Item } from '../items/entities';
import { ItemsService } from '../items/items.service';
import { ListItem } from '../list-item/entities/list-item.entity';
import { ListItemService } from '../list-item/list-item.service';
import { CreateListInput } from '../lists/dto';
import { List } from '../lists/entities/list.entity';
import { ListsService } from '../lists/lists.service';
import { CreateUserInput } from '../users/dto';
import { User } from '../users/entities';
import { UsersService } from '../users/users.service';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';

@Injectable()
export class SeedService {
  private readonly isProd: boolean;
  private readonly logger: Logger = new Logger('SeedService');

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(ListItem)
    private readonly listItemsRepository: Repository<ListItem>,
    @InjectRepository(List)
    private readonly listsRepository: Repository<List>,
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListsService,
    private readonly listItemsService: ListItemService,
  ) {
    this.isProd = configService.get<string>('NODE_ENV') === 'prod';
  }

  async executeSeed(): Promise<boolean> {
    // if (this.isProd) {
    //   throw new ForbiddenException(
    //     'It is not allowed to run seed on Production environment',
    //   );
    // }

    const usersData: CreateUserInput[] = [...SEED_USERS];
    const itemsData: CreateItemInput[] = [...SEED_ITEMS];
    const listsData: CreateListInput[] = [...SEED_LISTS];
    const paginationArgs: PaginationArgs = { limit: 30, offset: 0 };
    const searchArgs: SearchArgs = {};

    // 1. Limpiar la base de datos
    await this.cleanDatabase();

    // 2. Crear usuarios
    const users: User[] = await this.createUsers(usersData);
    const currentUser = users[0];

    // 3. Crear items
    await this.createItems(users, itemsData);

    // 4. Crear listas
    await this.createLists(users, listsData);

    // 5. Crear ListItems
    const currentUserItems = await this.itemsService.findAll(
      currentUser,
      paginationArgs,
      searchArgs,
    );
    const currentUserLists = await this.listsService.findAll(
      currentUser,
      paginationArgs,
      searchArgs,
    );
    await this.createListItems(currentUserLists, currentUserItems);

    return true;
  }

  async cleanDatabase(): Promise<boolean> {
    try {
      // await this.itemsRepository
      //   .createQueryBuilder()
      //   .delete()
      //   .where({})
      //   .execute();
      await this.listItemsRepository.delete({});
      await this.listsRepository.delete({});
      await this.itemsRepository.delete({});
      await this.usersRepository.delete({});
      return true;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Error trying to clean database records',
      );
    }
  }

  async createUsers(usersData: CreateUserInput[]): Promise<User[]> {
    try {
      return await Promise.all([
        ...usersData.map((userData) => {
          return this.usersService.createUser(userData);
        }),
      ]);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error trying to create users');
    }
  }

  async createItems(
    users: User[],
    itemsData: CreateItemInput[],
  ): Promise<Item[]> {
    try {
      return await Promise.all([
        ...itemsData.map((itemData) => {
          const index = this.generateRandomNumber(0, users.length);
          const user = users[index];
          return this.itemsService.create(itemData, user);
        }),
      ]);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error trying to create items');
    }
  }

  async createLists(
    users: User[],
    listsData: CreateListInput[],
  ): Promise<List[]> {
    try {
      return await Promise.all([
        ...listsData.map((listData) => {
          const index = this.generateRandomNumber(0, users.length);
          const user = users[index];
          return this.listsService.create(listData, user);
        }),
      ]);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error trying to create lists');
    }
  }

  async createListItems(lists: List[], items: Item[]): Promise<ListItem[]> {
    if (!lists || lists.length === 0) return [];
    return await Promise.all([
      ...items.map((item) => {
        const index = this.generateRandomNumber(0, lists.length);
        const list = lists[index];
        return this.listItemsService.create({
          completed: this.generateRandomNumber(0, 1) === 1,
          quantity: this.generateRandomNumber(),
          itemId: item.id,
          listId: list.id,
        });
      }),
    ]);
  }

  private generateRandomNumber(min: number = 0, max: number = 10): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
