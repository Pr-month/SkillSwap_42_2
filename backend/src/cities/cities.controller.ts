import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-access.guard';
import { Roles } from '../common/guards/roles.decorator';
import { UserRole } from '../users/users.enums';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Cities')
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create city' })
  @ApiResponse({
    status: 201,
    description: 'City created successfully',
    schema: {
      example: {
        id: 'city-id',
        name: 'Moscow',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createCityDto: CreateCityDto) {
    return this.citiesService.create(createCityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get cities list' })
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
    description: 'Cities returned successfully',
    schema: {
      example: {
        data: [
          {
            id: 'city-id',
            name: 'Moscow',
          },
        ],
        page: 1,
        totalPages: 1,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Page is out of range' })
  findAll(@Query() getCitiesDto: PaginationDto) {
    return this.citiesService.findAll(getCitiesDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get city by id' })
  @ApiParam({
    name: 'id',
    description: 'City id',
    example: 'city-id',
  })
  @ApiResponse({
    status: 200,
    description: 'City returned successfully',
    schema: {
      example: {
        id: 'city-id',
        name: 'Moscow',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'City not found' })
  findOne(@Param('id') id: string) {
    return this.citiesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update city' })
  @ApiParam({
    name: 'id',
    description: 'City id',
    example: 'city-id',
  })
  @ApiResponse({
    status: 200,
    description: 'City updated successfully',
    schema: {
      example: {
        id: 'city-id',
        name: 'Kazan',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'City not found' })
  update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    return this.citiesService.update(id, updateCityDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete city' })
  @ApiParam({
    name: 'id',
    description: 'City id',
    example: 'city-id',
  })
  @ApiResponse({
    status: 200,
    description: 'City deleted successfully',
    schema: {
      example: {
        id: 'city-id',
        name: 'Moscow',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'City not found' })
  remove(@Param('id') id: string) {
    return this.citiesService.remove(id);
  }
}
