import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create({
      name: createCategoryDto.name,
      parent: createCategoryDto.parent
        ? ({ id: createCategoryDto.parent } as Category)
        : null,
    });

    return this.categoryRepository.save(category);
  }

  findAll() {
    return this.categoryRepository.find({
      where: {
        parent: IsNull(),
      },
      relations: ['children'],
      order: {
        name: 'ASC',
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category with ${JSON.stringify(updateCategoryDto)}`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
