import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities';
import { CreateItemInput, UpdateItemInput } from './dto';
import { Item } from './entities';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem: Item = this.itemRepository.create({
      ...createItemInput,
      user,
    });
    return await this.itemRepository.save(newItem);
  }

  async findAll(user: User): Promise<Item[]> {
    return await this.itemRepository.findBy({
      user: {
        id: user.id,
      },
    });
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item: Item = await this.itemRepository.findOneBy({
      id,
      user: {
        id: user.id,
      },
    });
    // const item: Item = await this.itemRepository.findOne({
    //   where: { id, user: { id: user.id } },
    //   relations: { user: true },
    // });
    if (!item) throw new NotFoundException(`Item with id ${id} not found`);
    return item;
  }

  async update(
    id: string,
    updateItemInput: UpdateItemInput,
    user: User,
  ): Promise<Item> {
    await this.findOne(id, user);
    const item = await this.itemRepository.preload(updateItemInput);
    if (!item) throw new NotFoundException(`Item with id ${id} not found`);
    return this.itemRepository.save(item);
  }

  async remove(id: string, user: User): Promise<Item> {
    // TODO: soft delete, check referential integrity
    const item = await this.findOne(id, user);
    // await this.itemRepository.remove(item);
    await this.itemRepository.delete(id);
    return item;
  }

  async getItemsCount(user: User): Promise<number> {
    return await this.itemRepository.countBy({
      user: { id: user.id },
    });
  }
}
