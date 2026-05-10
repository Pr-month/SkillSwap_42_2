import bcrypt from 'bcryptjs';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { User, UserRole } from './entities/user.entity';
import { appConfig, TAppConfig } from '../config/app.config';

@Injectable()
export class UsersService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly config: TAppConfig,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private findUserMapper(): (User) => FindUserDto {
    return (root: User) => {
      return {
        name: root.name,
        email: root.email,
        about: root.about,
        birthdate: root.birthdate.toDateString(),
        city: root.city,
        gender: root.gender,
        wantToLearn: root.wantToLearn,
        createdAt: root.createdAt.toDateString(),
      };
    };
  }

  async create(createUserDto: CreateUserDto) {
    const now = new Date();
    const createdAt = now.toDateString();
    const hash = await bcrypt.hash(
      createUserDto.password,
      this.config.hashSalt,
    );
    // TODO: Add avatar Url after files service completion
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hash,
      createdAt: createdAt,
      updatedAt: createdAt,
      skills: [],
      wantToLearn: [],
      favoriteSkills: [],
      role: UserRole.USER,
      avatar: '',
      refreshToken: '',
      about: '',
    });
    return [newUser].map(this.findUserMapper())[0];
  }

  async findAll() {
    const users = await this.usersRepository.find({});
    return users.map(this.findUserMapper());
  }

  async findOneById(id: string) {
    const user = await this.usersRepository.findOne({
      where: {
        id: id,
      },
    });
    return [user].map(this.findUserMapper())[0];
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: {
        email: email,
      },
    });
    return [user].map(this.findUserMapper())[0];
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user with data ${JSON.stringify(updateUserDto)}}`;
  }
}
