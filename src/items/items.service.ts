import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemInput, UpdateItemInput } from './dto';
import { Item } from './entities';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput): Promise<Item> {
    const newItem = this.itemRepository.create(createItemInput);
    return await this.itemRepository.save(newItem);
  }

  async findAll(): Promise<Item[]> {
    return await this.itemRepository.find();
  }

  async findOne(id: string): Promise<Item> {
    const item: Item = await this.itemRepository.findOneBy({ id });
    if (!item) throw new NotFoundException(`Item with id ${id} not found`);
    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput) {
    const item = await this.itemRepository.preload(updateItemInput);
    if (!item) throw new NotFoundException(`Item with id ${id} not found`);
    return this.itemRepository.save(item);
  }

  async remove(id: string): Promise<Item> {
    // TODO: soft delete, check referential integrity
    const item = await this.findOne(id);
    // await this.itemRepository.remove(item);
    await this.itemRepository.delete(id);
    return item;
  }
}
