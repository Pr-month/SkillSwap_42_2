import { Exclude } from 'class-transformer';
import { FindUserDto } from '../../users/dto/find-user.dto';

export class FindSkillDto {
  id: string;
  title: string;
  category: string;
  images: string[];
  @Exclude()
  owner: FindUserDto;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<FindUserDto>) {
    Object.assign(this, partial);
  }
}
