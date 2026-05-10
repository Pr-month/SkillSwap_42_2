import { Gender } from '../entities/user.entity';

export class FindUserDto {
  id: string;
  name: string;
  email: string;
  about: string;
  birthdate: string;
  city: string;
  gender: Gender;
  wantToLearn: string[];
  createdAt: Date;
}
