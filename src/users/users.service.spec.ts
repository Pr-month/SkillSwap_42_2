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

  it('should correctly return user when use by Id', async () => {
    mockUsersRepository.findOne.mockReturnValue(users[0]);
    const result = await service.findOneById('1');
    expect(result).toStrictEqual(new FindUserDto(users[0]));
  });
});
