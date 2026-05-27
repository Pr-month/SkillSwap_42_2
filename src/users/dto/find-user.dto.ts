import { Gender, UserRole } from '../users.enums';
import { Exclude } from 'class-transformer';
import { Category } from '../../categories/entities/category.entity';
import { FindSkillDto } from 'src/skills/dto/find-skill.dto';

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
  skills!: FindSkillDto[];
  favoriteSkills: FindSkillDto[];
  @Exclude()
  refreshToken: string | null;
  wantToLearn: Category[];
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<FindUserDto>) {
    let mappedSkills: FindSkillDto[] = [];
    let mappedFavoriteSkills: FindSkillDto[] = [];
    if (partial.skills && partial.skills.length > 0) {
      mappedSkills = partial.skills.map((skill) => new FindSkillDto(skill));
    }
    if (partial.favoriteSkills && partial.favoriteSkills.length > 0) {
      mappedFavoriteSkills = partial.favoriteSkills.map(
        (skill) => new FindSkillDto(skill),
      );
    }
    Object.assign(this, {
      ...partial,
      skills: mappedSkills,
      favoriteSkills: mappedFavoriteSkills,
    });
  }
}
