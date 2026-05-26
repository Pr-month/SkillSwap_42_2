import { IsEnum } from 'class-validator';
import { RequestStatus } from '../requests.enums';

export class UpdateRequestDto {
  @IsEnum(RequestStatus)
  status!: RequestStatus;
}
