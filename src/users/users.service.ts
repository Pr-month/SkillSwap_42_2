import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
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
      };
    };
  }

  create(createUserDto: CreateUserDto) {
    return `This action adds a new user with data ${JSON.stringify(createUserDto)}`;
  }

  findAll() {
    return `This action returns all users`;
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

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
