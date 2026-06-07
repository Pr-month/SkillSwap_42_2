import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}
