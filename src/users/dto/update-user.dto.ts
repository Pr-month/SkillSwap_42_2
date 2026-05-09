import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsEmail, IsEnum, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { Gender } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsString()
  about: string;
  @IsDateString()
  birthdate: string;
  @IsString()
  city: string;
  @IsEnum(Gender)
  gender: Gender;
}
