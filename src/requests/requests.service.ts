import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { Repository } from 'typeorm';
import { SkillsService } from '../skills/skills.service';
import { FindRequestDto } from './dto/find-request.dto';
import { RequestStatus } from './requests.enums';

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

  findIncoming(userId: string) {
    return this.requestsRepository.find({
      where: {
        receiver: { id: userId },
      },
      relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findOutgoing(userId: string) {
    return this.requestsRepository.find({
      where: {
        sender: { id: userId },
      },
      relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} request`;
  }

  async update(id: string, updateRequestDto: UpdateRequestDto, userId: string) {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const isSender = request.sender.id === userId;
    const isReceiver = request.receiver.id === userId;

      if (!isSender && !isReceiver) {
      throw new ForbiddenException('User cannot update this request');
    }

    const isAcceptOrReject =
      updateRequestDto.status === RequestStatus.ACCEPTED ||
      updateRequestDto.status === RequestStatus.REJECTED;

    if (isAcceptOrReject && !isReceiver) {
      throw new ForbiddenException('Only receiver can accept or reject request');
    }

    request.status = updateRequestDto.status;

    return this.requestsRepository.save(request);
  }

  remove(id: number) {
    return `This action removes a #${id} request`;
  }
}
