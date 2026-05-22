import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { Repository } from 'typeorm';
import { SkillsService } from '../skills/skills.service';
import { FindRequestDto } from './dto/find-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    private readonly skillsService: SkillsService,
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
  ) {}

  async create(userId: string, createRequestDto: CreateRequestDto) {
    const requestedSkill = await this.skillsService.findSkillWithOwner(
      createRequestDto.requestedSkillId,
    );
    if (!requestedSkill)
      throw new NotFoundException('Requested skill not found');
    const request = this.requestsRepository.create({
      sender: { id: userId },
      receiver: requestedSkill?.owner,
      offeredSkill: { id: createRequestDto.offeredSkillId },
      requestedSkill: requestedSkill,
    });
    const savedRequest = await this.requestsRepository.save(request);
    return new FindRequestDto(savedRequest);
  }

  findAll() {
    return `This action returns all requests`;
  }

  findOne(id: number) {
    return `This action returns a #${id} request`;
  }

  update(id: number, updateRequestDto: UpdateRequestDto) {
    return `This action updates a #${id} request with ${JSON.stringify(updateRequestDto)}`;
  }

  remove(id: number) {
    return `This action removes a #${id} request`;
  }
}
