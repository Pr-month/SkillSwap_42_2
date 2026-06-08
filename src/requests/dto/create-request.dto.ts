import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateRequestDto {
  @ApiProperty({
    example: '5344b508-6566-471a-852f-520c3fc229c9',
    description: 'id of skill which user wants to learn',
  })
  @IsUUID()
  requestedSkillId: string;

  @ApiProperty({
    example: '5344b507-6566-471a-852f-520c3fc229c9',
    description: 'id of skill which user offers for swapping',
  })
  @IsUUID()
  offeredSkillId: string;
}
