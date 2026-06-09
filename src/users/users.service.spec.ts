import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { appConfig } from '../config/app.config';
import { usersData } from '../seeding/data/users.data';
import { UserRole } from './users.enums';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import * as bcrypt from 'bcrypt';
import { FindSkillDto } from 'src/skills/dto/find-skill.dto';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  const mockConfig = {
    hashSalt: 10,
  };

  const currentDate = new Date();

  const users = [
    {
      ...usersData[0],
      wantToLearn: [],
      skills: [],
      favoriteSkills: [],
      role: UserRole.USER,
      createdAt: currentDate,
      updatedAt: currentDate,
      password: 'hashed_password',
      id: '1',
      avatar: '',
    },
    {
      ...usersData[1],
      wantToLearn: [],
      skills: [
        {
          title: 'Python',
          description: 'Универсальный язык программирования',
          category: {
            id: '1',
            name: 'Программирование',
            parent: null,
            children: [],
          },
          images: [],
          id: '1',
          owner: null as unknown as FindUserDto,
          createdAt: currentDate,
          updatedAt: currentDate,
        },
      ],
      favoriteSkills: [],
      role: UserRole.USER,
      createdAt: currentDate,
      updatedAt: currentDate,
      password: 'hashed_another_password',
      id: '2',
      avatar: '',
    },
  ];

  const mockQueryBuilder = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockReturnValue([users, users.length]),
  };

  const mockUsersRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUsersRepository },
        { provide: appConfig.KEY, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should correctly create user and return new FindUserDto from data', async () => {
    const createUserData = {
      ...usersData[0],
      wantToLearn: [],
      skills: [],
      favoriteSkills: [],
      role: UserRole.USER,
      password: 'hashed_password',
    };

    const createUserResult = users[0];

    jest.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as never);
    mockUsersRepository.create.mockReturnValue(createUserResult);
    mockUsersRepository.save.mockResolvedValue(createUserResult);
    const result = await service.create({
      ...usersData[0],
      wantToLearn: [],
    } as CreateUserDto);
    expect(mockUsersRepository.create).toHaveBeenCalledWith(createUserData);
    expect(mockUsersRepository.save).toHaveBeenCalledWith(createUserResult);
    expect(result).toStrictEqual(new FindUserDto(createUserResult));
  });

  it('should throw an error when findAll page is more than total pages', async () => {
    const pagination = { page: 99, limit: 20 };
    await expect(service.findAll(pagination)).rejects.toThrow(
      'Page is out of range',
    );
  });

  it('should correctly return all users', async () => {
    const expectedResult = {
      page: 1,
      totalPages: 1,
      data: users.map((user) => new FindUserDto(user)),
    };

    const result = await service.findAll({ page: 1, limit: 20 });
    expect(result).toStrictEqual(expectedResult);
  });

  it('should correctly return user when search by id', async () => {
    mockUsersRepository.findOne.mockImplementationOnce(
      (param: Record<string, Record<string, any>>) =>
        users.find((user) => user.id === param.where.id),
    );
    const result = await service.findOneById(users[0].id);
    expect(result).toStrictEqual(new FindUserDto(users[0]));
  });

  it('should correctly return user when search by email', async () => {
    mockUsersRepository.findOneBy.mockImplementationOnce(
      (param: Record<string, string>) =>
        users.find((user) => user.email === param.email),
    );
    const result = await service.findOneByEmail(users[0].email as string);
    expect(result).toStrictEqual(new FindUserDto(users[0]));
  });

  it('should correctly update user', async () => {
    const updatedUser = { ...users[0], name: 'Иван Петров' };
    mockUsersRepository.findOneBy.mockImplementationOnce(
      (param: Record<string, string>) =>
        users.find((user) => user.id === param.id),
    );
    mockUsersRepository.save.mockReturnValueOnce(updatedUser);
    const result = await service.update(users[0].id, { name: 'Иван Петров' });
    expect(result).toStrictEqual(new FindUserDto(updatedUser));
  });

  it('should throw an error when update password with incorrect old one', async () => {
    mockUsersRepository.findOneBy.mockImplementationOnce(
      (param: Record<string, string>) =>
        users.find((user) => user.id === param.id),
    );
    jest.mocked(bcrypt.compare).mockResolvedValue(false as never);
    await expect(
      service.updatePassword(users[0].id, 'some_password', 'new_password'),
    ).rejects.toThrow('Current password is incorrect');
  });

  it('should update password', async () => {
    mockUsersRepository.findOneBy.mockImplementationOnce(
      (param: Record<string, string>) =>
        users.find((user) => user.id === param.id),
    );
    const updatedUser = {
      ...users[0],
      password: 'new_hashed_password',
      refreshToken: null,
    };
    mockUsersRepository.update.mockReturnValueOnce(updatedUser);
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
    jest.mocked(bcrypt.hash).mockResolvedValue('new_hashed_password' as never);
    const result = await service.updatePassword(
      users[0].id,
      'some_password',
      'new_password',
    );
    expect(result).toStrictEqual(updatedUser);
  });

  it('should correctly remove skill from favs and throw an error if skill is not there', async () => {
    const skill = users[1].skills[0];
    mockUsersRepository.findOne.mockImplementation(
      (param: Record<string, Record<string, any>>) =>
        users.find((user) => user.id === param.where.id),
    );
    await expect(
      service.removeFavoriteSkill(users[0].id, skill.id),
    ).rejects.toThrow('Skill is not in favorites');
    mockUsersRepository.save.mockReturnValueOnce({
      ...users[0],
      favoriteSkills: [new FindSkillDto(skill)],
    });
    await service.addFavoriteSkill(users[0].id, skill.id);
    const result = await service.removeFavoriteSkill(users[0].id, skill.id);
    expect(result).toStrictEqual(new FindUserDto(users[0]));
  });

  it('should correctly add skill to favorites and throw an error if skill added again', async () => {
    const skill = users[1].skills[0];
    mockUsersRepository.findOne.mockImplementation(
      (param: Record<string, Record<string, any>>) =>
        users.find((user) => user.id === param.where.id),
    );
    mockUsersRepository.save.mockReturnValueOnce({
      ...users[0],
      favoriteSkills: [new FindSkillDto(skill)],
    });
    const result = await service.addFavoriteSkill(users[0].id, skill.id);
    expect(result.favoriteSkills).toStrictEqual([new FindSkillDto(skill)]);
    await expect(
      service.addFavoriteSkill(users[0].id, skill.id),
    ).rejects.toThrow('Skill is already in favorites');
  });
});
