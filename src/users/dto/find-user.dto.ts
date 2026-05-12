import { Gender } from '../users.enums';

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
