import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Gender } from '../users.enums';

export class CreateUserDto {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(6)
  password: string;
  @IsString()
  @IsOptional()
  about: string;
  @IsDateString()
  birthdate: string;
  @IsString()
  city: string;
  @IsEnum(Gender)
  gender: Gender;
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  wantToLearn: string[];
}
