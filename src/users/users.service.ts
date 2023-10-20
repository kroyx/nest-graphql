import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  ArrayOverlap,
  EntityNotFoundError,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { SignupInput } from '../auth/dto';
import { Roles } from '../auth/enums/roles.enum';
import { UpdateUserInput } from './dto';
import { User } from './entities';

@Injectable()
export class UsersService {
  private logger = new Logger('UserService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(roles: Roles[]): Promise<User[]> {
    if (!roles || roles.length === 0) {
      return this.userRepository.find({
        relations: { lastUpdateBy: true },
      });
    }

    // return await this.userRepository.findBy({
    //   roles: ArrayOverlap(roles),
    // });
    return await this.userRepository.find({
      where: {
        roles: ArrayOverlap(roles),
      },
      relations: { lastUpdateBy: true },
    });
  }

  async findOne(id: string): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async findByEmail(email: string): Promise<User> {
    // const user = await this.userRepository.findOneBy({ email });
    // if (!user)
    //   throw new NotFoundException(`User with email ${email} not found`);
    // return user;
    try {
      return await this.userRepository.findOneByOrFail({ email });
    } catch (error) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
  }

  async updateUser(
    updateUserInput: UpdateUserInput,
    updatedByUser: User,
  ): Promise<User> {
    const { id, password } = updateUserInput;

    await this.findOne(id);

    if (password) {
      updateUserInput.password = bcrypt.hashSync(password, 10);
    }
    const user = await this.userRepository.preload(updateUserInput);
    user.lastUpdateBy = updatedByUser;
    return await this.userRepository.save(user);
  }

  async block(id: string, userUpdatedBy: User): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = false;
    user.lastUpdateBy = userUpdatedBy;
    return await this.userRepository.save(user);
  }

  async createUser(signupInput: SignupInput): Promise<User> {
    try {
      const hashedPassword = bcrypt.hashSync(signupInput.password, 10);
      const newUser = this.userRepository.create({
        ...signupInput,
        password: hashedPassword,
      });
      return await this.userRepository.save(newUser);
    } catch (error) {
      this.handleErrors(error);
    }
  }

  private handleErrors(error: unknown): never {
    this.logger.error(error);
    const errorAny = error as any;
    if (error instanceof QueryFailedError) {
      throw new BadRequestException(errorAny.detail);
    }
    if (error instanceof EntityNotFoundError) {
      throw new NotFoundException(error.message);
    }
    throw new InternalServerErrorException(errorAny.message);
  }
}
