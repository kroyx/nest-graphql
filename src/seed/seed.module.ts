import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ItemsModule } from '../items/items.module';
import { UsersModule } from '../users/users.module';
import { SeedService } from './seed.service';
import { SeedResolver } from './seed.resolver';

@Module({
  imports: [ConfigModule, UsersModule, ItemsModule],
  providers: [SeedResolver, SeedService],
})
export class SeedModule {}
