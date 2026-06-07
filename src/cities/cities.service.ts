import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  create(createCityDto: CreateCityDto) {
    const city = this.cityRepository.create(createCityDto);
    return this.cityRepository.save(city);
  }

  async findAll(getCitiesDto: PaginationDto) {
    const { page = 1, limit = 20 } = getCitiesDto;

    const [cities, total] = await this.cityRepository
      .createQueryBuilder('city')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('city.name', 'ASC')
      .getManyAndCount();
    const totalPages = total ? Math.ceil(total / limit) : 1;
    if (totalPages < page) throw new NotFoundException('Page is out of range');

    return {
      data: cities,
      page,
      totalPages,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} city`;
  }

  update(id: number, updateCityDto: UpdateCityDto) {
    void updateCityDto;
    return `This action updates a #${id} city`;
  }

  async remove(id: string) {
    const city = await this.cityRepository.findOneBy({ id });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    await this.cityRepository.remove(city);
    return city;
  }
}
