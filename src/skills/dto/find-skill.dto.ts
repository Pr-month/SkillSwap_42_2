import { Exclude } from 'class-transformer';
import { FindUserDto } from '../../users/dto/find-user.dto';
import { Category } from '../../categories/entities/category.entity';

export class FindSkillDto {
  id: string;
  title: string;
  category: Category | null;
  images: string[];
  @Exclude()
  owner: FindUserDto;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<FindSkillDto>) {
    Object.assign(this, partial);
  }
}
