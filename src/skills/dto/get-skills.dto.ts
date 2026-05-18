import { IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class GetSkillsDto extends PaginationDto {
  @IsString()
  search: string;

  @IsString()
  category: string;
}
