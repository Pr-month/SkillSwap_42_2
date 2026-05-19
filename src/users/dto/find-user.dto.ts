import { Skill } from 'src/skills/entities/skill.entity';
import { Gender, UserRole } from '../users.enums';
import { Exclude } from 'class-transformer';

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
  wantToLearn: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<FindUserDto>) {
    Object.assign(this, partial);
  }
}
