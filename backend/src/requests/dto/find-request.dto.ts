import { ApiProperty } from '@nestjs/swagger';
import { Skill } from '../../skills/entities/skill.entity';
import { User } from '../../users/entities/user.entity';
import { RequestStatus } from '../requests.enums';
import { FindUserDto } from 'src/users/dto/find-user.dto';
import { FindSkillDto } from 'src/skills/dto/find-skill.dto';

export class FindRequestDto {
  @ApiProperty({
    example: '5344b508-6566-471a-852f-520c3fc229c9',
    description: 'skill id',
  })
  id: string;
  @ApiProperty({
    description: 'User who sended request',
    type: FindUserDto,
  })
  sender: User;
  @ApiProperty({
    description: 'User who receives request',
    type: FindUserDto,
  })
  receiver: User;
  @ApiProperty({
    example: RequestStatus.PENDING,
    description: 'Status of request',
  })
  status: RequestStatus;
  @ApiProperty({
    description: 'Skill that sender offers for swapping',
    type: FindSkillDto,
  })
  offeredSkill: Skill;
  @ApiProperty({
    description: 'Skill that sender wants to learn',
    type: FindSkillDto,
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
