import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities';
import { UsersService } from '../users/users.service';
import { SigninInput, SignupInput } from './dto';
import { AuthResponseType } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signupInput: SignupInput): Promise<AuthResponseType> {
    const user = await this.userService.createUser(signupInput);
    const token = this.getJwtToken(user.id);
    return { token, user };
  }

  async signIn(signinInput: SigninInput): Promise<AuthResponseType> {
    const { email, password } = signinInput;

    // Retrieve user associated with email
    const user = await this.userService.findByEmail(email);
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credentials are not correct');
    }

    // Generate JWT
    const token = this.getJwtToken(user.id);
    return { token, user };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.userService.findOne(id);
    if (!user.isActive) {
      throw new UnauthorizedException(
        'User is not active, talk with an administrator',
      );
    }
    delete user.password;
    return user;
  }

  renewToken(user: User) {
    return this.getJwtToken(user.id);
  }

  private getJwtToken(userId: string) {
    return this.jwtService.sign({ id: userId });
  }
}
