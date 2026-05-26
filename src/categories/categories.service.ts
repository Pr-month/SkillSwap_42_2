import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.parent === id) {
      throw new BadRequestException('Category cannot be parent of itself');
    }

    if (updateCategoryDto.name !== undefined) {
      category.name = updateCategoryDto.name;
    }

    if (updateCategoryDto.parent !== undefined) {
      category.parent = { id: updateCategoryDto.parent } as Category;
    }

    return this.categoryRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryRepository.remove(category);

    return category;
  }
}
