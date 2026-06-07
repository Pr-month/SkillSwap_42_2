import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../users.enums';

export class CreateUserDto {
  @ApiProperty({
    example: 'Barbara',
    description: 'User name',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
  })
  @IsString()
  password!: string;

  @ApiPropertyOptional({
    example: 'I like learning new skills',
    description: 'Short information about user',
  })
  @IsString()
  @IsOptional()
  about!: string;

  @ApiProperty({
    example: '1998-05-15',
    description: 'User birth date',
  })
  @IsDateString()
  birthdate!: string;

  @ApiProperty({
    example: 'Moscow',
    description: 'User city',
  })
  @IsString()
  city!: string;

  @ApiProperty({
    enum: Gender,
    example: Gender.FEMALE,
    description: 'User gender',
  })
  @IsEnum(Gender)
  gender!: Gender;

  @ApiProperty({
    example: ['category-id-1', 'category-id-2'],
    description: 'Categories user wants to learn',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  wantToLearn!: string[];
}
