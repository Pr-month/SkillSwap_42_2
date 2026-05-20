import {
  IsString,
  IsOptional,
  IsArray,
  IsUrl,
  MaxLength,
  MinLength,
  ArrayMaxSize,
  IsUUID,
} from 'class-validator';

export class CreateSkillDto {
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsUUID()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({ require_host: false }, { each: true })
  @ArrayMaxSize(10)
  images?: string[];
}
