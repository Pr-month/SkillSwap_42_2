import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
    description: 'Current user password',
  })
  @IsString()
  oldPassword!: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'New user password',
  })
  @IsString()
  newPassword!: string;
}
