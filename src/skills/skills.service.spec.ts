import { Test, TestingModule } from '@nestjs/testing';
import { SkillsService } from './skills.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { UsersService } from '../users/users.service';
import { FilesService } from '../files/files.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('SkillsService', () => {
  let service: SkillsService;

  const mockSkillsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUsersService = {
    addFavoriteSkill: jest.fn(),
    removeFavoriteSkill: jest.fn(),
  };

  const mockFilesService = {
    extractFilename: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: getRepositoryToken(Skill),
          useValue: mockSkillsRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a skill', async () => {
    const ownerId = 'owner-id';
    const dto = {
      title: 'Guitar',
      description: 'I can teach guitar basics',
      category: 'category-id',
      images: ['image-url'],
    };
    const skill = {
      ...dto,
      category: { id: dto.category },
      owner: { id: ownerId },
    };
    const savedSkill = {
      id: 'skill-id',
      ...skill,
    };

    mockSkillsRepository.create.mockReturnValue(skill);
    mockSkillsRepository.save.mockResolvedValue(savedSkill);

    const result = await service.create(dto, ownerId);

    expect(mockSkillsRepository.create).toHaveBeenCalledWith({
      ...dto,
      category: { id: dto.category },
      owner: { id: ownerId },
    });
    expect(mockSkillsRepository.save).toHaveBeenCalledWith(skill);
    expect(result).toBe(savedSkill);
  });

  it('should add skill to favorites', async () => {
    const skillId = 'skill-id';
    const userId = 'user-id';
    const resultDto = {
      id: userId,
      favoriteSkills: [{ id: skillId }],
    };

    mockUsersService.addFavoriteSkill.mockResolvedValue(resultDto);

    const result = await service.addToFavorite(skillId, userId);

    expect(mockUsersService.addFavoriteSkill).toHaveBeenCalledWith(
      userId,
      skillId,
    );
    expect(result).toBe(resultDto);
  });

  it('should remove skill from favorites', async () => {
    const skillId = 'skill-id';
    const userId = 'user-id';
    const resultDto = {
      id: userId,
      favoriteSkills: [],
    };

    mockUsersService.removeFavoriteSkill.mockResolvedValue(resultDto);

    const result = await service.removeFromFavorite(skillId, userId);

    expect(mockUsersService.removeFavoriteSkill).toHaveBeenCalledWith(
      userId,
      skillId,
    );
    expect(result).toBe(resultDto);
  });

  it('should find skill with owner', async () => {
    const skill = {
      id: 'skill-id',
      owner: { id: 'owner-id' },
    };

    mockSkillsRepository.findOne.mockResolvedValue(skill);

    const result = await service.findSkillWithOwner(skill.id);

    expect(mockSkillsRepository.findOne).toHaveBeenCalledWith({
      where: { id: skill.id },
      relations: ['owner'],
    });
    expect(result).toBe(skill);
  });

  it('should throw NotFoundException when requested page is out of range', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 1]),
    };

    mockSkillsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(service.findAll({ page: 2, limit: 20 })).rejects.toThrow(
      NotFoundException,
    );

    expect(mockSkillsRepository.createQueryBuilder).toHaveBeenCalledWith(
      'skill',
    );
    expect(queryBuilder.skip).toHaveBeenCalledWith(20);
    expect(queryBuilder.take).toHaveBeenCalledWith(20);
    expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
  });

  it('should find similar skills', async () => {
    const skill = {
      id: 'skill-id',
      category: { id: 'category-id' },
    };
    const similarSkills = [
      {
        id: 'similar-skill-id',
        category: skill.category,
      },
    ];
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(similarSkills),
    };

    mockSkillsRepository.findOne.mockResolvedValue(skill);
    mockSkillsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await service.findSimilar(skill.id);

    expect(mockSkillsRepository.findOne).toHaveBeenCalledWith({
      where: { id: skill.id },
      relations: ['category'],
    });
    expect(mockSkillsRepository.createQueryBuilder).toHaveBeenCalledWith(
      'skill',
    );
    expect(queryBuilder.where).toHaveBeenCalledWith('skill.id != :id', {
      id: skill.id,
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'category.id = :category',
      {
        category: skill.category.id,
      },
    );
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
    expect(result).toBe(similarSkills);
  });

  it('should throw NotFoundException when finding similar skills for missing skill', async () => {
    mockSkillsRepository.findOne.mockResolvedValue(null);

    await expect(service.findSimilar('missing-skill-id')).rejects.toThrow(
      NotFoundException,
    );

    expect(mockSkillsRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('should update skill owned by user', async () => {
    const ownerId = 'owner-id';
    const skill = {
      id: 'skill-id',
      title: 'Old title',
      description: 'Old description',
      images: ['old-image.jpg'],
      owner: { id: ownerId },
    };
    const dto = {
      title: 'New title',
      description: 'New description',
    };

    mockSkillsRepository.findOne.mockResolvedValue(skill);
    mockSkillsRepository.save.mockResolvedValue(skill);

    const result = await service.update(skill.id, dto, ownerId);

    expect(mockSkillsRepository.findOne).toHaveBeenCalledWith({
      where: { id: skill.id },
      relations: ['owner'],
    });
    expect(skill).toEqual({
      id: 'skill-id',
      title: 'New title',
      description: 'New description',
      images: ['old-image.jpg'],
      owner: { id: ownerId },
    });
    expect(mockSkillsRepository.save).toHaveBeenCalledWith(skill);
    expect(result).toEqual(skill);
  });

  it('should delete old images when updating skill images', async () => {
    const ownerId = 'owner-id';
    const skill = {
      id: 'skill-id',
      title: 'Guitar',
      images: ['/uploads/old-image.jpg', '/uploads/keep-image.jpg'],
      owner: { id: ownerId },
    };
    const dto = {
      images: ['/uploads/keep-image.jpg', '/uploads/new-image.jpg'],
    };

    mockSkillsRepository.findOne.mockResolvedValue(skill);
    mockSkillsRepository.save.mockResolvedValue(skill);
    mockFilesService.extractFilename.mockReturnValue('old-image.jpg');

    const result = await service.update(skill.id, dto, ownerId);

    expect(mockFilesService.extractFilename).toHaveBeenCalledWith(
      '/uploads/old-image.jpg',
    );
    expect(mockFilesService.deleteFile).toHaveBeenCalledWith('old-image.jpg');
    expect(mockSkillsRepository.save).toHaveBeenCalledWith(skill);
    expect(result).toEqual(skill);
  });

  it('should throw NotFoundException when updating missing skill', async () => {
    mockSkillsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update('missing-skill-id', { title: 'New title' }, 'owner-id'),
    ).rejects.toThrow(NotFoundException);

    expect(mockSkillsRepository.save).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when updating another user skill', async () => {
    const skill = {
      id: 'skill-id',
      owner: { id: 'owner-id' },
      images: [],
    };

    mockSkillsRepository.findOne.mockResolvedValue(skill);

    await expect(
      service.update(skill.id, { title: 'New title' }, 'other-user-id'),
    ).rejects.toThrow(ForbiddenException);

    expect(mockSkillsRepository.save).not.toHaveBeenCalled();
  });

  it('should remove skill owned by user and delete images', async () => {
    const ownerId = 'owner-id';
    const skill = {
      id: 'skill-id',
      title: 'Guitar',
      images: ['/uploads/first.jpg', '/uploads/second.jpg'],
      owner: { id: ownerId },
    };

    mockSkillsRepository.findOne.mockResolvedValue(skill);
    mockSkillsRepository.remove.mockResolvedValue(skill);
    mockFilesService.extractFilename
      .mockReturnValueOnce('first.jpg')
      .mockReturnValueOnce('second.jpg');

    const result = await service.remove(skill.id, ownerId);

    expect(mockSkillsRepository.findOne).toHaveBeenCalledWith({
      where: { id: skill.id },
      relations: ['owner'],
    });
    expect(mockFilesService.extractFilename).toHaveBeenCalledWith(
      '/uploads/first.jpg',
    );
    expect(mockFilesService.extractFilename).toHaveBeenCalledWith(
      '/uploads/second.jpg',
    );
    expect(mockFilesService.deleteFile).toHaveBeenCalledWith('first.jpg');
    expect(mockFilesService.deleteFile).toHaveBeenCalledWith('second.jpg');
    expect(mockSkillsRepository.remove).toHaveBeenCalledWith(skill);
    expect(result).toEqual(skill);
  });

  it('should throw NotFoundException when removing missing skill', async () => {
    mockSkillsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.remove('missing-skill-id', 'owner-id'),
    ).rejects.toThrow(NotFoundException);

    expect(mockSkillsRepository.remove).not.toHaveBeenCalled();
    expect(mockFilesService.deleteFile).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when removing another user skill', async () => {
    const skill = {
      id: 'skill-id',
      owner: { id: 'owner-id' },
      images: [],
    };

    mockSkillsRepository.findOne.mockResolvedValue(skill);

    await expect(service.remove(skill.id, 'other-user-id')).rejects.toThrow(
      ForbiddenException,
    );

    expect(mockSkillsRepository.remove).not.toHaveBeenCalled();
    expect(mockFilesService.deleteFile).not.toHaveBeenCalled();
  });
});
