import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { RequestStatus } from './requests.enums';
import { UserRole } from '../users/users.enums';

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

  async remove(id: string, userId: string, userRole: UserRole) {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: ['sender'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const isSender = request.sender.id === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isSender && !isAdmin) {
      throw new ForbiddenException('User cannot delete this request');
    }

    await this.requestsRepository.remove(request);

    return request;
  }
}
