import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationArgs, SearchArgs } from '../common/dto/args';
import { CreateListItemInput } from './dto/inputs/create-list-item.input';
import { UpdateListItemInput } from './dto/inputs/update-list-item.input';
import { ListItem } from './entities/list-item.entity';

@Injectable()
export class ListItemService {
  constructor(
    @InjectRepository(ListItem)
    private readonly listItemsRepository: Repository<ListItem>,
  ) {}

  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {
    const { itemId, listId, ...rest } = createListItemInput;
    const newListItem = this.listItemsRepository.create({
      ...rest,
      item: { id: itemId },
      list: { id: listId },
    });
    // return await this.listItemsRepository.save(newListItem);

    // Para la consulta de los datos de las relaciones tras la creación
    await this.listItemsRepository.save(newListItem);
    return this.findOneById(newListItem.id);
  }

  async findAll(paginationArgs: PaginationArgs): Promise<ListItem[]> {
    const { limit = 10, offset = 0 } = paginationArgs;
    return await this.listItemsRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOneById(id: string) {
    const listItem = this.listItemsRepository.findOneBy({ id });
    if (!listItem) {
      throw new NotFoundException(`ListItem with id ${id} not found`);
    }
    return listItem;
  }

  async findAllByList(
    listId: string,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<ListItem[]> {
    const { limit = 10, offset = 0 } = paginationArgs;
    const search = searchArgs.search;
    const queryBuilder = this.listItemsRepository
      .createQueryBuilder('listItem')
      .innerJoin('listItem.item', 'item')
      .skip(offset)
      .take(limit)
      .where(`"listId" = :listId`, { listId });
    if (search) {
      queryBuilder.andWhere(`LOWER(item.name) like :name`, {
        name: `%${search.toLowerCase()}%`,
      });
    }
    return queryBuilder.getMany();
  }

  async listItemCountByList(listId: string): Promise<number> {
    return this.listItemsRepository.countBy({
      list: { id: listId },
    });
  }

  async update(
    id: string,
    updateListItemInput: UpdateListItemInput,
  ): Promise<ListItem> {
    const { itemId, listId, ...rest } = updateListItemInput;
    const queryBuilder = this.listItemsRepository
      .createQueryBuilder()
      .update()
      .set(rest)
      .where('id = :id', { id });
    if (listId) queryBuilder.set({ list: { id: listId } });
    if (itemId) queryBuilder.set({ item: { id: itemId } });

    await queryBuilder.execute();
    return this.findOneById(id);
  }

  remove(id: string) {
    return `This action removes a #${id} listItem`;
  }
}
