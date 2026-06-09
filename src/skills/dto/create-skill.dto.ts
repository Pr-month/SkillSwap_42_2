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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({
    example: 'Guitar lessons',
    description: 'Skill title',
    minLength: 3,
    maxLength: 150,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title!: string;

  @ApiPropertyOptional({
    example: 'I can teach basic guitar chords',
    description: 'Skill description',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    example: 'category-id',
    description: 'Category id',
  })
  @IsOptional()
  @IsUUID()
  category?: string;

  @ApiPropertyOptional({
    example: ['/uploads/guitar.jpg'],
    description: 'Skill image urls',
    type: [String],
    maxItems: 10,
  })
  @IsOptional()
  @IsArray()
  @IsUrl({ require_host: false }, { each: true })
  @ArrayMaxSize(10)
  images?: string[];
}
