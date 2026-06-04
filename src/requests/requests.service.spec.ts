import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RequestsService } from './requests.service';
import { Request } from './entities/request.entity';
import { SkillsService } from '../skills/skills.service';
import { UsersService } from '../users/users.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationType } from '../notifications/notifications.enums';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { RequestStatus } from './requests.enums';
import { Gender, UserRole } from '../users/users.enums';

jest.mock('../notifications/notifications.gateway', () => ({
  NotificationsGateway: class NotificationsGateway {},
}));

describe('RequestsService', () => {
  let service: RequestsService;

  const mockRequestsRepository = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockSkillsService = {
    findSkillWithOwner: jest.fn(),
  };

  const mockUsersService = {
    findOneById: jest.fn(),
  };

  const mockNotificationsGateway = {
    notifyUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(Request),
          useValue: mockRequestsRepository,
        },
        {
          provide: SkillsService,
          useValue: mockSkillsService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: NotificationsGateway,
          useValue: mockNotificationsGateway,
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return incoming requests', async () => {
    const userId = 'receiver-id';
    const requests = [
      {
        id: 'request-id',
        receiver: { id: userId },
      },
    ];

    mockRequestsRepository.find.mockResolvedValue(requests);

    const result = await service.findIncoming(userId);

    expect(mockRequestsRepository.find).toHaveBeenCalledWith({
      where: {
        receiver: { id: userId },
      },
      relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
      order: {
        createdAt: 'DESC',
      },
    });
    expect(result).toBe(requests);
  });

  it('should return outgoing requests', async () => {
    const userId = 'sender-id';
    const requests = [
      {
        id: 'request-id',
        sender: { id: userId },
      },
    ];

    mockRequestsRepository.find.mockResolvedValue(requests);

    const result = await service.findOutgoing(userId);

    expect(mockRequestsRepository.find).toHaveBeenCalledWith({
      where: {
        sender: { id: userId },
      },
      relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
      order: {
        createdAt: 'DESC',
      },
    });
    expect(result).toBe(requests);
  });

  it('should create a request and notify receiver', async () => {
    const userId = 'sender-id';
    const dto = {
      offeredSkillId: 'offered-skill-id',
      requestedSkillId: 'requested-skill-id',
    };
    const sender = {
      id: userId,
      name: 'Barbara',
    };
    const receiver = {
      id: 'receiver-id',
    };
    const requestedSkill = {
      id: dto.requestedSkillId,
      owner: receiver,
    };
    const request = {
      sender: { id: userId },
      receiver,
      offeredSkill: { id: dto.offeredSkillId },
      requestedSkill,
    };
    const savedRequest = {
      id: 'request-id',
      ...request,
    };

    mockSkillsService.findSkillWithOwner.mockResolvedValue(requestedSkill);
    mockUsersService.findOneById.mockResolvedValue(sender);
    mockRequestsRepository.create.mockReturnValue(request);
    mockRequestsRepository.save.mockResolvedValue(savedRequest);

    const result = await service.create(userId, dto);

    expect(mockSkillsService.findSkillWithOwner).toHaveBeenCalledWith(
      dto.requestedSkillId,
    );
    expect(mockUsersService.findOneById).toHaveBeenCalledWith(userId);
    expect(mockRequestsRepository.create).toHaveBeenCalledWith({
      sender: { id: userId },
      receiver,
      offeredSkill: { id: dto.offeredSkillId },
      requestedSkill,
    });
    expect(mockRequestsRepository.save).toHaveBeenCalledWith(request);
    expect(mockNotificationsGateway.notifyUser).toHaveBeenCalledWith(
      receiver.id,
      {
        notificationType: NotificationType.NEW_REQUEST,
        notificationMessage: `Поступила новая заявка от пользователя ${sender.name}`,
      },
    );
    expect(result).toEqual(savedRequest);
  });

  it('should throw NotFoundException when requested skill is missing', async () => {
    mockSkillsService.findSkillWithOwner.mockResolvedValue(null);

    await expect(
      service.create('sender-id', {
        offeredSkillId: 'offered-skill-id',
        requestedSkillId: 'missing-skill-id',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(mockRequestsRepository.create).not.toHaveBeenCalled();
    expect(mockRequestsRepository.save).not.toHaveBeenCalled();
    expect(mockNotificationsGateway.notifyUser).not.toHaveBeenCalled();
  });

  it('should accept request by receiver and notify sender', async () => {
    const request = {
      id: 'request-id',
      sender: { id: 'sender-id' },
      receiver: {
        id: 'receiver-id',
        name: 'Anna',
        gender: Gender.FEMALE,
      },
      status: RequestStatus.PENDING,
    };

    mockRequestsRepository.findOne.mockResolvedValue(request);
    mockRequestsRepository.save.mockResolvedValue(request);

    const result = await service.update(
      request.id,
      { status: RequestStatus.ACCEPTED },
      request.receiver.id,
    );

    expect(mockRequestsRepository.findOne).toHaveBeenCalledWith({
      where: { id: request.id },
      relations: ['sender', 'receiver'],
    });
    expect(request.status).toBe(RequestStatus.ACCEPTED);
    expect(mockNotificationsGateway.notifyUser).toHaveBeenCalledWith(
      request.sender.id,
      {
        notificationType: NotificationType.REQUEST_ACCEPTED,
        notificationMessage: 'Пользователь Anna приняла Вашу заявку',
      },
    );
    expect(mockRequestsRepository.save).toHaveBeenCalledWith(request);
    expect(result).toBe(request);
  });

  it('should throw NotFoundException when updating missing request', async () => {
    mockRequestsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update(
        'missing-request-id',
        { status: RequestStatus.ACCEPTED },
        'receiver-id',
      ),
    ).rejects.toThrow(NotFoundException);

    expect(mockRequestsRepository.save).not.toHaveBeenCalled();
    expect(mockNotificationsGateway.notifyUser).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user cannot update request', async () => {
    const request = {
      id: 'request-id',
      sender: { id: 'sender-id' },
      receiver: { id: 'receiver-id' },
      status: RequestStatus.PENDING,
    };

    mockRequestsRepository.findOne.mockResolvedValue(request);

    await expect(
      service.update(
        request.id,
        { status: RequestStatus.ACCEPTED },
        'other-user-id',
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(mockRequestsRepository.save).not.toHaveBeenCalled();
    expect(mockNotificationsGateway.notifyUser).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when sender tries to accept request', async () => {
    const request = {
      id: 'request-id',
      sender: { id: 'sender-id' },
      receiver: { id: 'receiver-id' },
      status: RequestStatus.PENDING,
    };

    mockRequestsRepository.findOne.mockResolvedValue(request);

    await expect(
      service.update(
        request.id,
        { status: RequestStatus.ACCEPTED },
        request.sender.id,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(mockRequestsRepository.save).not.toHaveBeenCalled();
    expect(mockNotificationsGateway.notifyUser).not.toHaveBeenCalled();
  });

  it('should remove request by sender', async () => {
    const request = {
      id: 'request-id',
      sender: { id: 'sender-id' },
    };

    mockRequestsRepository.findOne.mockResolvedValue(request);
    mockRequestsRepository.remove.mockResolvedValue(request);

    const result = await service.remove(
      request.id,
      request.sender.id,
      UserRole.USER,
    );

    expect(mockRequestsRepository.findOne).toHaveBeenCalledWith({
      where: { id: request.id },
      relations: ['sender'],
    });
    expect(mockRequestsRepository.remove).toHaveBeenCalledWith(request);
    expect(result).toBe(request);
  });

  it('should remove request by admin', async () => {
    const request = {
      id: 'request-id',
      sender: { id: 'sender-id' },
    };

    mockRequestsRepository.findOne.mockResolvedValue(request);
    mockRequestsRepository.remove.mockResolvedValue(request);

    const result = await service.remove(request.id, 'admin-id', UserRole.ADMIN);

    expect(mockRequestsRepository.remove).toHaveBeenCalledWith(request);
    expect(result).toBe(request);
  });

  it('should throw NotFoundException when removing missing request', async () => {
    mockRequestsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.remove('missing-request-id', 'sender-id', UserRole.USER),
    ).rejects.toThrow(NotFoundException);

    expect(mockRequestsRepository.remove).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user cannot remove request', async () => {
    const request = {
      id: 'request-id',
      sender: { id: 'sender-id' },
    };

    mockRequestsRepository.findOne.mockResolvedValue(request);

    await expect(
      service.remove(request.id, 'other-user-id', UserRole.USER),
    ).rejects.toThrow(ForbiddenException);

    expect(mockRequestsRepository.remove).not.toHaveBeenCalled();
  });
});
