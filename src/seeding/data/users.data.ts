import { CreateUserDto } from '../../users/dto/create-user.dto';
import { Gender } from '../../users/users.enums';

export const usersData: Partial<CreateUserDto>[] = [
  {
    name: 'Владимир Семенов',
    email: 'vlad.semenov@mail.ru',
    password: 'Password123!',
    about: 'fullstack developer',
    birthdate: '1995-03-15',
    city: 'Сызрань',
    gender: Gender.MALE,
    wantToLearn: ['React', 'Node.js', 'TypeScript'],
  },
  {
    name: 'Марта Кукетская',
    email: 'martakuk@rambler.ru',
    password: 'Password123!',
    about: 'frontend developer',
    birthdate: '1993-07-22',
    city: 'Магадан',
    gender: Gender.FEMALE,
    wantToLearn: ['Vue.js', 'Angular', 'TailwindCSS'],
  },
];
