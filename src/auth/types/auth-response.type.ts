import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entities';

@ObjectType()
export class AuthResponseType {
  @Field(() => String)
  token: string;

  @Field(() => User)
  user: User;
}
