import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-access.guard';
import { TAuthRequest } from '../auth/auth.types';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get users list' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Users returned successfully',
    schema: {
      example: {
        data: [
          {
            id: 'user-id',
            name: 'Ivan',
            email: 'ivan@example.com',
            about: 'I like learning new skills',
            city: 'Saint Petersburg',
            avatar: '/uploads/avatar.jpg',
          },
        ],
        page: 1,
        totalPages: 1,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Page is out of range' })
  findAll(@Query() getUsersDto: PaginationDto) {
    return this.usersService.findAll(getUsersDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({
    status: 200,
    description: 'Current user returned successfully',
    schema: {
      example: {
        id: 'user-id',
        name: 'Ivan',
        email: 'ivan@example.com',
        about: 'I like learning new skills',
        city: 'Saint Petersburg',
        avatar: '/uploads/avatar.jpg',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findCurrent(@Req() req: TAuthRequest) {
    const userId = req.user.sub;
    return this.usersService.findOneById(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({
    name: 'id',
    description: 'User id',
    example: 'user-id',
  })
  @ApiResponse({
    status: 200,
    description: 'User returned successfully',
    schema: {
      example: {
        id: 'user-id',
        name: 'Ivan',
        email: 'ivan@example.com',
        about: 'I like learning new skills',
        city: 'Saint Petersburg',
        avatar: '/uploads/avatar.jpg',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user' })
  @ApiResponse({
    status: 200,
    description: 'Current user updated successfully',
    schema: {
      example: {
        id: 'user-id',
        name: 'Ivan',
        email: 'ivan@example.com',
        about: 'Updated profile description',
        city: 'Moscow',
        avatar: '/uploads/avatar.jpg',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateCurrent(
    @Req() req: TAuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = req.user.sub;
    return this.usersService.update(userId, updateUserDto);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user password' })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
    schema: {
      example: {
        message: 'Password successfully changed',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
}
