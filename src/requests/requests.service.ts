import { Injectable } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
  ) {}

  create(createRequestDto: CreateRequestDto) {
    return `This action adds a new request with ${JSON.stringify(createRequestDto)}`;
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

  update(id: number, updateRequestDto: UpdateRequestDto) {
    return `This action updates a #${id} request with ${JSON.stringify(updateRequestDto)}`;
  }

  remove(id: number) {
    return `This action removes a #${id} request`;
  }
}
