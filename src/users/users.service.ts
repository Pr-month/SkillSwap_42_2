import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRole } from './users.enums';
import { appConfig, TAppConfig } from '../config/app.config';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { FindUserDto } from './dto/find-user.dto';
import { Skill } from '../skills/entities/skill.entity';

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
    const wantToLearn = createUserDto.wantToLearn.map((id) => ({ id }));
    // TODO: Add avatar Url after files service completion
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hash,
      skills: [],
      wantToLearn,
      favoriteSkills: [],
      role: UserRole.USER,
    });
    const savedUser = await this.usersRepository.save(newUser);
    return new FindUserDto(savedUser);
  }

  async findAll(
    getUsersDto: PaginationDto,
  ): Promise<PaginatedResponseDto<FindUserDto>> {
    const { page = 1, limit = 20 } = getUsersDto;

    const [users, total] = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.favoriteSkills', 'favoriteSkills')
      .leftJoinAndSelect('user.skills', 'skills')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();
    const totalPages = total ? Math.ceil(total / limit) : 1;
    if (totalPages < page) throw new NotFoundException('Page is out of range');

    return {
      data: users.map((user) => new FindUserDto(user)),
      page,
      totalPages,
    };
  }

  async findOneById(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id: id },
      relations: ['skills', 'favoriteSkills'],
    });
    return user === null ? user : new FindUserDto(user);
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({ email });
    return user === null ? user : new FindUserDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id });
    const wantToLearn = updateUserDto.wantToLearn?.map((id) => ({ id }));
    if (!user) return null;
    Object.assign(user, { ...updateUserDto, wantToLearn: wantToLearn });
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

  async addFavoriteSkill(userId: string, skillId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['favoriteSkills'],
    });
    if (!user) throw new UnauthorizedException();
    if (user.favoriteSkills.some((skill) => skill.id === skillId))
      throw new ConflictException('Skill is already in favorites');

    user.favoriteSkills.push({ id: skillId } as Skill);
    const updatedUser = await this.usersRepository.save(user);
    return new FindUserDto(updatedUser);
  }

  async removeFavoriteSkill(userId: string, skillId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['favoriteSkills'],
    });
    if (!user) throw new UnauthorizedException();
    if (!user.favoriteSkills.some((skill) => skill.id === skillId))
      throw new BadRequestException('Skill is not in favorites');

    user.favoriteSkills = user.favoriteSkills.filter(
      (skill) => skill.id !== skillId,
    );
    const updatedUser = await this.usersRepository.save(user);
    return new FindUserDto(updatedUser);
  }

  async setRefreshToken(id: string, refreshToken: string | null) {
    return await this.usersRepository.update(id, {
      refreshToken,
    });
  }
}
