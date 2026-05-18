import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { GetSkillsDto } from './dto/get-skills.dto';
import { Skill } from './entities/skill.entity';
import { GetSkillsResponseDto } from './dto/get-skills-response.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  create(createSkillDto: CreateSkillDto) {
    return `This action adds a new skill with data ${JSON.stringify(createSkillDto)}`;
  }

  async findAll(getSkillsDto: GetSkillsDto): Promise<GetSkillsResponseDto> {
    const { page = 1, limit = 20, search = '', category } = getSkillsDto;
    const [skills, total] = await this.skillsRepository
      .createQueryBuilder('skill')
      // TODO: add category search when category entity is ready
      .where('skill.title = :title', { title: search })
      .andWhere('skill.category = :category', { category: category })
      .skip(+page)
      .take(+limit)
      .getManyAndCount();
    const totalPages = Math.floor(total / limit);
    if (total > 0 && totalPages < page)
      throw new NotFoundException('Page is out of range');
    return {
      data: skills,
      page,
      totalPages,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} skill`;
  }

  update(id: number, updateSkillDto: UpdateSkillDto) {
    return `This action updates a #${id} skill with data ${JSON.stringify(updateSkillDto)}`;
  }

  remove(id: number) {
    return `This action removes a #${id} skill`;
  }
}
