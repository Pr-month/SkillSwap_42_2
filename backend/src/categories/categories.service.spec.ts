import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoriesService } from './categories.service';
import { IsNull } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a root category', async () => {
    const dto = { name: 'Education' };
    const category = {
      id: 'category-id',
      name: dto.name,
      parent: null,
    };

    mockCategoryRepository.create.mockReturnValue(category);
    mockCategoryRepository.save.mockResolvedValue(category);

    const result = await service.create(dto);

    expect(mockCategoryRepository.create).toHaveBeenCalledWith({
      name: dto.name,
      parent: null,
    });
    expect(mockCategoryRepository.save).toHaveBeenCalledWith(category);
    expect(result).toBe(category);
  });

  it('should create a child category', async () => {
    const dto = {
      name: 'Programming',
      parent: 'parent-category-id',
    };
    const category = {
      id: 'category-id',
      name: dto.name,
      parent: { id: dto.parent },
    };

    mockCategoryRepository.create.mockReturnValue(category);
    mockCategoryRepository.save.mockResolvedValue(category);

    const result = await service.create(dto);

    expect(mockCategoryRepository.create).toHaveBeenCalledWith({
      name: dto.name,
      parent: { id: dto.parent },
    });
    expect(mockCategoryRepository.save).toHaveBeenCalledWith(category);
    expect(result).toBe(category);
  });

  it('should return root categories with children', async () => {
    const categories = [
      {
        id: 'category-id',
        name: 'Education',
        parent: null,
        children: [],
      },
    ];

    mockCategoryRepository.find.mockResolvedValue(categories);

    const result = await service.findAll();

    expect(mockCategoryRepository.find).toHaveBeenCalledWith({
      where: {
        parent: IsNull(),
      },
      relations: ['children'],
      order: {
        name: 'ASC',
      },
    });
    expect(result).toBe(categories);
  });

  it('should update a category', async () => {
    const category = {
      id: 'category-id',
      name: 'Old name',
      parent: null,
    };
    const dto = {
      name: 'New name',
      parent: 'parent-category-id',
    };

    mockCategoryRepository.findOne.mockResolvedValue(category);
    mockCategoryRepository.save.mockResolvedValue(category);

    const result = await service.update(category.id, dto);

    expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
      where: { id: category.id },
    });
    expect(category).toEqual({
      id: 'category-id',
      name: 'New name',
      parent: { id: 'parent-category-id' },
    });
    expect(mockCategoryRepository.save).toHaveBeenCalledWith(category);
    expect(result).toBe(category);
  });

  it('should throw NotFoundException when updating missing category', async () => {
    mockCategoryRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update('missing-category-id', { name: 'New name' }),
    ).rejects.toThrow(NotFoundException);

    expect(mockCategoryRepository.save).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when category is its own parent', async () => {
    const category = {
      id: 'category-id',
      name: 'Education',
      parent: null,
    };

    mockCategoryRepository.findOne.mockResolvedValue(category);

    await expect(
      service.update(category.id, { parent: category.id }),
    ).rejects.toThrow(BadRequestException);

    expect(mockCategoryRepository.save).not.toHaveBeenCalled();
  });

  it('should remove a category', async () => {
    const category = {
      id: 'category-id',
      name: 'Education',
      parent: null,
    };

    mockCategoryRepository.findOne.mockResolvedValue(category);
    mockCategoryRepository.remove.mockResolvedValue(category);

    const result = await service.remove(category.id);

    expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
      where: { id: category.id },
    });
    expect(mockCategoryRepository.remove).toHaveBeenCalledWith(category);
    expect(result).toBe(category);
  });

  it('should throw NotFoundException when removing missing category', async () => {
    mockCategoryRepository.findOne.mockResolvedValue(null);

    await expect(service.remove('missing-category-id')).rejects.toThrow(
      NotFoundException,
    );

    expect(mockCategoryRepository.remove).not.toHaveBeenCalled();
  });
});
