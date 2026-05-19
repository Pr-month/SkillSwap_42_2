import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { GetSkillsDto } from './dto/get-skills.dto';
import { Skill } from './entities/skill.entity';
import { GetSkillsResponseDto } from './dto/get-skills-response.dto';
import { FilesService } from '../files/files.service';
import { FindSkillDto } from './dto/find-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    private readonly filesService: FilesService,
  ) {}

  create(createSkillDto: CreateSkillDto, ownerId: string) {
    const newSkill = this.skillsRepository.create({
      ...createSkillDto,
      owner: { id: ownerId },
    });
    return this.skillsRepository.save(newSkill);
  }

  async findAll(getSkillsDto: GetSkillsDto): Promise<GetSkillsResponseDto> {
    const { page = 1, limit = 20, search = '', category } = getSkillsDto;

    // TODO: add fields to category search when category entity is ready
    const qb = this.skillsRepository.createQueryBuilder('skill');

    if (category) {
      qb.where('category = :category', { category });
    }

    qb.andWhere(
      new Brackets((qb) => {
        qb.where('skill.title ILIKE :title', {
          title: `%${search}%`,
        }).orWhere('category ILIKE :category', { category: `%${search}%` });
      }),
    );

    const [skills, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('skill.createdAt', 'DESC')
      .getManyAndCount();

    const totalPages = total ? Math.ceil(total / limit) : 1;
    if (totalPages < page) throw new NotFoundException('Page is out of range');
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

  async remove(id: string, ownerId: string) {
    const skill = await this.findSkillOwnedByUser(id, ownerId);
    const imagesFilenames = skill.images.map((image) =>
      this.filesService.extractFilename(image),
    );
    imagesFilenames.forEach((filename) =>
      this.filesService.deleteFile(filename),
    );
    await this.skillsRepository.remove(skill);
    return new FindSkillDto(skill);
  }

  private async findSkillOwnedByUser(skillId: string, ownerId: string) {
    const skill = await this.skillsRepository.findOne({
      where: { id: skillId },
      relations: ['owner'],
    });

    if (!skill) throw new NotFoundException('Skill not found');

    if (ownerId !== skill.owner.id)
      throw new ForbiddenException('User does not own the skill');

    return skill;
  }
}
