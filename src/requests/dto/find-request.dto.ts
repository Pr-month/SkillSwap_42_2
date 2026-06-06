import { ApiProperty } from '@nestjs/swagger';
import { Skill } from '../../skills/entities/skill.entity';
import { User } from '../../users/entities/user.entity';
import { RequestStatus } from '../requests.enums';

export class FindRequestDto {
  @ApiProperty({
    example: '5344b508-6566-471a-852f-520c3fc229c9',
    description: 'skill id',
  })
  id: string;
  @ApiProperty({
    example: {
      id: '77ded24e-e965-4d51-89cd-2b4672ce3fe3',
      name: 'Марта Кукетская',
      email: 'martakuk@rambler.ru',
      about: 'frontend developer',
      birthdate: '1993-07-22',
      city: 'Магадан',
      gender: 'FEMALE',
      avatar: '/uploads/image.png',
      skills: [
        {
          id: '252798d9-2778-4003-8b88-cb544141207b',
          title: 'JavaScript',
          images: [],
          createdAt: '2026-05-26T12:03:22.205Z',
          updatedAt: '2026-05-26T12:03:22.205Z',
          description: 'Современный язык программирования для веб-разработки',
        },
      ],
      favoriteSkills: [],
      createdAt: '2026-05-26T09:24:55.426Z',
      updatedAt: '2026-06-06T17:15:59.602Z',
    },
    description: 'User who sended request',
  })
  sender: User;
  @ApiProperty({
    example: {
      id: '77ded24e-e965-4d51-89cd-2b4672ce3fe3',
      name: 'Марта Кукетская',
      email: 'martakuk@rambler.ru',
      about: 'frontend developer',
      birthdate: '1993-07-22',
      city: 'Магадан',
      gender: 'FEMALE',
      avatar: '/uploads/image.png',
      skills: [
        {
          id: '252798d9-2778-4003-8b88-cb544141207b',
          title: 'JavaScript',
          images: [],
          createdAt: '2026-05-26T12:03:22.205Z',
          updatedAt: '2026-05-26T12:03:22.205Z',
          description: 'Современный язык программирования для веб-разработки',
        },
      ],
      favoriteSkills: [],
      createdAt: '2026-05-26T09:24:55.426Z',
      updatedAt: '2026-06-06T17:15:59.602Z',
    },
    description: 'User who receives request',
  })
  receiver: User;
  @ApiProperty({
    example: RequestStatus.PENDING,
    description: 'Status of request',
  })
  status: RequestStatus;
  @ApiProperty({
    example: {
      id: '252798d9-2778-4003-8b88-cb544141207b',
      title: 'JavaScript',
      images: [],
      createdAt: '2026-05-26T12:03:22.205Z',
      updatedAt: '2026-05-26T12:03:22.205Z',
      description: 'Современный язык программирования для веб-разработки',
    },
    description: 'Skill that sender offers for swapping',
  })
  offeredSkill: Skill;
  @ApiProperty({
    example: {
      id: '252798d9-2778-4003-8b88-cb544141207b',
      title: 'JavaScript',
      images: [],
      createdAt: '2026-05-26T12:03:22.205Z',
      updatedAt: '2026-05-26T12:03:22.205Z',
      description: 'Современный язык программирования для веб-разработки',
    },
    description: 'Skill that sender wants to learn',
  })
  requestedSkill: Skill;
  @ApiProperty({
    example: true,
    description: 'is request read',
  })
  isRead: boolean;

  constructor(partial: Partial<FindRequestDto>) {
    Object.assign(this, partial);
  }
}
