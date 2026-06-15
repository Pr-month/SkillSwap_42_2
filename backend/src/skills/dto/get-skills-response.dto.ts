import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { FindSkillDto } from './find-skill.dto';

export class GetSkillsResponseDto extends PaginatedResponseDto<FindSkillDto> {}
