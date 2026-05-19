import { FindUserDto } from 'src/users/dto/find-user.dto';

export class FindSkillDto {
  id: string;
  title: string;
  category: string;
  images: string[];
  owner: FindUserDto;
}
