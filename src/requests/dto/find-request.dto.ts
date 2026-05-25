import { Skill } from '../../skills/entities/skill.entity';
import { User } from '../../users/entities/user.entity';
import { RequestStatus } from '../requests.enums';

export class FindRequestDto {
  id: string;
  sender: User;
  receiver: User;
  status: RequestStatus;
  offeredSkill: Skill;
  requestedSkill: Skill;
  isRead: boolean;

  constructor(partial: Partial<FindRequestDto>) {
    Object.assign(this, partial);
  }
}
