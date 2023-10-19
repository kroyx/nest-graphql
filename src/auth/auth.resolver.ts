import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '../users/entities';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { SigninInput, SignupInput } from './dto';
import { Roles } from './enums/roles.enum';
import { GqlJwtAuthGuard } from './guards/gql-jwt-auth.guard';
import { AuthResponseType } from './types';

@Resolver(() => AuthResponseType)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponseType, { name: 'signUp' })
  async signUp(
    @Args('signUpInput', { type: () => SignupInput }) signupInput: SignupInput,
  ): Promise<AuthResponseType> {
    return this.authService.signUp(signupInput);
  }

  @Mutation(() => AuthResponseType, { name: 'signIn' })
  async signIn(
    @Args('signInInput', { type: () => SigninInput }) signInInput: SigninInput,
  ): Promise<AuthResponseType> {
    return this.authService.signIn(signInInput);
  }

  @Query(() => AuthResponseType, { name: 'revalidate' })
  @UseGuards(GqlJwtAuthGuard)
  revalidate(@CurrentUser([Roles.ADMIN]) user: User): AuthResponseType {
    const token = this.authService.renewToken(user);
    return { token, user };
  }
}
