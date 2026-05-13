import { Gender } from '../entities/user.entity';

// TODO: delete if won't be needed
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
