import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListItemModule } from '../list-item/list-item.module';
import { List } from './entities/list.entity';
import { ListsService } from './lists.service';
import { ListsResolver } from './lists.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([List]), ListItemModule],
  providers: [ListsResolver, ListsService],
  exports: [TypeOrmModule, ListsService],
})
export class ListsModule {}
