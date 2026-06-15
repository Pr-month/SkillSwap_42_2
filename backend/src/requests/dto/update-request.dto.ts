import { IsEnum } from 'class-validator';
import { RequestStatus } from '../requests.enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRequestDto {
  @ApiProperty({
    example: RequestStatus.PENDING,
    description: 'Status of request',
  })
  @IsEnum(RequestStatus)
  status!: RequestStatus;
}
