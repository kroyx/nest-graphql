import { ArgsType, Field } from '@nestjs/graphql';
import { IsArray, IsOptional } from 'class-validator';
import { Roles } from '../../../auth/enums/roles.enum';

@ArgsType()
export class RolesArgs {
  @Field(() => [Roles], { nullable: true })
  @IsOptional()
  @IsArray()
  roles: Roles[] = [];
}
