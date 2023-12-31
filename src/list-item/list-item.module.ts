import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListItem } from './entities/list-item.entity';
import { ListItemService } from './list-item.service';
import { ListItemResolver } from './list-item.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([ListItem])],
  providers: [ListItemResolver, ListItemService],
  exports: [TypeOrmModule, ListItemService],
})
export class ListItemModule {}
