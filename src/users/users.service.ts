import * as bcrypt from 'bcrypt';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRole } from './users.enums';
import { appConfig, TAppConfig } from '../config/app.config';
import { FindUserDto } from './dto/find-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly config: TAppConfig,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private async generateHash(str: string) {
    return await bcrypt.hash(str, this.config.hashSalt);
  }

  async create(createUserDto: CreateUserDto) {
    const hash = await this.generateHash(createUserDto.password);
    // TODO: Add avatar Url after files service completion
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hash,
      skills: [],
      favoriteSkills: [],
      role: UserRole.USER,
    });
    const savedUser = await this.usersRepository.save(newUser);
    return new FindUserDto(savedUser);
  }

  async findAll() {
    const users = await this.usersRepository.find({});
    return users.map((user) => new FindUserDto(user));
  }

  async findOneById(id: string) {
    const user = await this.usersRepository.findOneBy({ id });
    return user === null ? user : new FindUserDto(user);
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({ email });
    return user === null ? user : new FindUserDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) return null;
    Object.assign(user, updateUserDto);
    await this.usersRepository.save(user);
    return new FindUserDto(user);
  }

  async updatePassword(id: string, oldPassword: string, newPassword: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) return null;

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hash = await this.generateHash(newPassword);
    const updatedUser = await this.usersRepository.update(id, {
      password: hash,
      refreshToken: null,
    });
    return updatedUser;
  }

  async setRefreshToken(id: string, refreshToken: string | null) {
    return await this.usersRepository.update(id, {
      refreshToken,
    });
  }
}
