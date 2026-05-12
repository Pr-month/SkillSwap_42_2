import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-access.guard';
import { TAuthRequest } from 'src/auth/auth.types';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findCurrent(@Req() req: TAuthRequest) {
    const userId = req.user.sub;
    return this.usersService.findOneById(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateCurrent(
    @Req() req: TAuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = req.user.sub;
    return this.usersService.update(userId, updateUserDto);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  async updateCurrentPassword(
    @Req() req: TAuthRequest,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.sub;
    await this.usersService.updatePassword(
      userId,
      updatePasswordDto.oldPassword,
      updatePasswordDto.newPassword,
    );
    res.clearCookie('refresh_token');
    return { message: 'Password successfully changed' };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
}
