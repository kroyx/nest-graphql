import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemInput } from '../items/dto';
import { Item } from '../items/entities';
import { ItemsService } from '../items/items.service';
import { CreateUserInput } from '../users/dto';
import { User } from '../users/entities';
import { UsersService } from '../users/users.service';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';

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
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
  ) {
    this.isProd = configService.get<string>('NODE_ENV') === 'prod';
  }

  async executeSeed(): Promise<boolean> {
    if (this.isProd) {
      throw new ForbiddenException(
        'It is not allowed to run seed on Production environment',
      );
    }

    const usersData: CreateUserInput[] = [...SEED_USERS];
    const itemsData: CreateItemInput[] = [...SEED_ITEMS];

    // 1. Limpiar la base de datos
    await this.cleanDatabase();

    // 2. Crear usuarios
    const users: User[] = await this.createUsers(usersData);

    // 3. Crear items
    await this.createItems(users, itemsData);
    return true;
  }

  async cleanDatabase(): Promise<boolean> {
    try {
      await this.itemsRepository.delete({});
      // await this.itemsRepository
      //   .createQueryBuilder()
      //   .delete()
      //   .where({})
      //   .execute();
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
          const index = this.generateRandomUsersIndex(users);
          const user = users[index];
          return this.itemsService.create(itemData, user);
        }),
      ]);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error trying to create items');
    }
  }

  private generateRandomUsersIndex(users: User[]): number {
    const max = users.length;
    return Math.floor(Math.random() * max);
  }
}
