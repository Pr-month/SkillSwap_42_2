import { Skill } from '../../skills/entities/skill.entity';
import { Gender, UserRole } from '../users.enums';
import { Exclude } from 'class-transformer';
import { Category } from '../../categories/entities/category.entity';

export class FindUserDto {
  id: string;
  name: string;
  email: string;
  @Exclude()
  password: string;
  @Exclude()
  role: UserRole;
  about: string;
  birthdate: string;
  city: string;
  gender: Gender;
  avatar: string;
  // TODO: replace with GetSkillDto
  skills!: Skill[];
  // TODO: replace with GetSkillDto
  favoriteSkills: Skill[];
  @Exclude()
  refreshToken: string | null;
  wantToLearn: Category[];
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<FindUserDto>) {
    Object.assign(this, partial);
  }
}
