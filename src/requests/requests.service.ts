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
import { Gender, UserRole } from '../users/users.enums';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { UsersService } from '../users/users.service';
import { NotificationType } from '../notifications/notifications.enums';

@Injectable()
export class RequestsService {
  constructor(
    private readonly skillsService: SkillsService,
    private readonly usersService: UsersService,
    private readonly notificationsGateway: NotificationsGateway,
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
  ) {}

  async create(userId: string, createRequestDto: CreateRequestDto) {
    const requestedSkill = await this.skillsService.findSkillWithOwner(
      createRequestDto.requestedSkillId,
    );
    if (!requestedSkill)
      throw new NotFoundException('Requested skill not found');
    const requestSender = await this.usersService.findOneById(userId);
    const requestReceiver = requestedSkill?.owner;
    const request = this.requestsRepository.create({
      sender: { id: userId },
      receiver: requestReceiver,
      offeredSkill: { id: createRequestDto.offeredSkillId },
      requestedSkill: requestedSkill,
    });
    const savedRequest = await this.requestsRepository.save(request);
    this.notificationsGateway.notifyUser(requestReceiver.id, {
      notificationType: NotificationType.NEW_REQUEST,
      notificationMessage: `Поступила новая заявка от ${requestSender!.name}`,
    });
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
      throw new ForbiddenException(
        'Only receiver can accept or reject request',
      );
    }

    request.status = updateRequestDto.status;

    if (isAcceptOrReject) {
      const notificationType =
        updateRequestDto.status === RequestStatus.ACCEPTED
          ? NotificationType.REQUEST_ACCEPTED
          : NotificationType.REQUEST_REJECTED;
      const notificationMessage = `Пользователь ${request.receiver.name} ${RequestStatus.ACCEPTED ? 'принял' : 'отклонил'}${request.receiver.gender === Gender.FEMALE ? 'а' : ''} Вашу заявку`;
      this.notificationsGateway.notifyUser(request.sender.id, {
        notificationType,
        notificationMessage,
      });
    }

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
