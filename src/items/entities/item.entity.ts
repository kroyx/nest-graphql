import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  Index,
  ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ListItem } from '../../list-item/entities/list-item.entity';
import { User } from '../../users/entities';

@Entity({ name: 'items' })
@ObjectType()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => String)
  name: string;

  // @Column()
  // @Field(() => Float)
  // quantity: number;

  @Column({
    name: 'quantity_units',
    nullable: true,
  })
  @Field(() => String, { nullable: true })
  quantityUnits?: string;

  @ManyToOne(() => User, (user) => user.items, { nullable: false, lazy: true })
  @Field(() => User)
  @Index('userId-index')
  user: User;

  @OneToMany(() => ListItem, (listItem) => listItem.list, {
    nullable: true,
    lazy: true,
  })
  @Field(() => [ListItem])
  listItems: ListItem[];
}
