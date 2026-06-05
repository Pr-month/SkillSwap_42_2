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
import { nodeModuleNameResolver } from 'typescript';
import { FindSkillDto } from 'src/skills/dto/find-skill.dto';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  const mockUsersRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
  };
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
    ).rejects.toThrow();
  });
});
