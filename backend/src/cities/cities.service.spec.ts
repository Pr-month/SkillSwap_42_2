import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';

describe('CitiesService', () => {
  let service: CitiesService;

  const mockCityRepository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        {
          provide: getRepositoryToken(City),
          useValue: mockCityRepository,
        },
      ],
    }).compile();

    service = module.get<CitiesService>(CitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create city', async () => {
    const createCityDto = { name: 'Moscow' };
    const city = { id: 'city-id', name: 'Moscow' };

    mockCityRepository.create.mockReturnValue(city);
    mockCityRepository.save.mockResolvedValue(city);

    await expect(service.create(createCityDto)).resolves.toEqual(city);

    expect(mockCityRepository.create).toHaveBeenCalledWith(createCityDto);
    expect(mockCityRepository.save).toHaveBeenCalledWith(city);
  });

  it('should return paginated cities', async () => {
    const cities = [
      { id: 'city-1', name: 'Moscow' },
      { id: 'city-2', name: 'Saint Petersburg' },
    ];

    const queryBuilder = {
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([cities, 2]),
    };

    mockCityRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(service.findAll({ page: 1, limit: 20 })).resolves.toEqual({
      data: cities,
      page: 1,
      totalPages: 1,
    });

    expect(mockCityRepository.createQueryBuilder).toHaveBeenCalledWith('city');
    expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    expect(queryBuilder.take).toHaveBeenCalledWith(20);
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('city.name', 'ASC');
  });

  it('should throw NotFoundException when page is out of range', async () => {
    const queryBuilder = {
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 1]),
    };

    mockCityRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(service.findAll({ page: 2, limit: 20 })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update city', async () => {
    const city = { id: 'city-id', name: 'Moscow' };
    const updateCityDto = { name: 'Kazan' };
    const updatedCity = { id: 'city-id', name: 'Kazan' };

    mockCityRepository.findOneBy.mockResolvedValue(city);
    mockCityRepository.save.mockResolvedValue(updatedCity);

    await expect(service.update('city-id', updateCityDto)).resolves.toEqual(
      updatedCity,
    );

    expect(mockCityRepository.findOneBy).toHaveBeenCalledWith({ id: 'city-id' });
    expect(mockCityRepository.save).toHaveBeenCalledWith(updatedCity);
  });

  it('should throw NotFoundException when city for update is not found', async () => {
    mockCityRepository.findOneBy.mockResolvedValue(null);

    await expect(service.update('city-id', { name: 'Kazan' })).rejects.toThrow(
      NotFoundException,
    );

    expect(mockCityRepository.findOneBy).toHaveBeenCalledWith({ id: 'city-id' });
    expect(mockCityRepository.save).not.toHaveBeenCalled();
  });

  it('should remove city', async () => {
    const city = { id: 'city-id', name: 'Moscow' };

    mockCityRepository.findOneBy.mockResolvedValue(city);
    mockCityRepository.remove.mockResolvedValue(city);

    await expect(service.remove('city-id')).resolves.toEqual(city);

    expect(mockCityRepository.findOneBy).toHaveBeenCalledWith({ id: 'city-id' });
    expect(mockCityRepository.remove).toHaveBeenCalledWith(city);
  });

  it('should throw NotFoundException when city for remove is not found', async () => {
    mockCityRepository.findOneBy.mockResolvedValue(null);

    await expect(service.remove('city-id')).rejects.toThrow(NotFoundException);

    expect(mockCityRepository.findOneBy).toHaveBeenCalledWith({ id: 'city-id' });
    expect(mockCityRepository.remove).not.toHaveBeenCalled();
  });
});
