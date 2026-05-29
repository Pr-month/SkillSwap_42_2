import { IsString, MaxLength } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @MaxLength(100)
  name: string;
}
