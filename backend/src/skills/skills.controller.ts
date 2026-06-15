import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
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
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { GetSkillsDto } from './dto/get-skills.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-access.guard';
import { TAuthRequest } from '../auth/auth.types';

@ApiTags('Skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create skill' })
  @ApiResponse({
    status: 201,
    description: 'Skill created successfully',
    schema: {
      example: {
        id: 'skill-id',
        title: 'Guitar lessons',
        description: 'I can teach basic guitar chords',
        category: {
          id: 'category-id',
          name: 'Music',
        },
        images: ['/uploads/guitar.jpg'],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Req() req: TAuthRequest, @Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get skills list' })
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
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by skill title or category name',
    example: 'guitar',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Category id',
    example: 'category-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Skills returned successfully',
    schema: {
      example: {
        data: [
          {
            id: 'skill-id',
            title: 'Guitar lessons',
            description: 'I can teach basic guitar chords',
            images: ['/uploads/guitar.jpg'],
          },
        ],
        page: 1,
        totalPages: 1,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 404, description: 'Page is out of range' })
  findAll(@Query() getSkillsDto: GetSkillsDto) {
    return this.skillsService.findAll(getSkillsDto);
  }

  @Get(':id/similar')
  @ApiOperation({ summary: 'Get similar skills' })
  @ApiParam({
    name: 'id',
    description: 'Skill id',
    example: 'skill-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Similar skills returned successfully',
    schema: {
      example: [
        {
          id: 'similar-skill-id',
          title: 'Ukulele lessons',
          description: 'I can teach basic ukulele chords',
          images: ['/uploads/ukulele.jpg'],
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  findSimilar(@Param('id') id: string) {
    return this.skillsService.findSimilar(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update skill' })
  @ApiParam({
    name: 'id',
    description: 'Skill id',
    example: 'skill-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Skill updated successfully',
    schema: {
      example: {
        id: 'skill-id',
        title: 'Updated guitar lessons',
        description: 'I can teach basic and intermediate guitar chords',
        images: ['/uploads/guitar.jpg'],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'User does not own the skill' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  update(
    @Param('id') id: string,
    @Req() req: TAuthRequest,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return this.skillsService.update(id, updateSkillDto, req.user.sub);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add skill to favorites' })
  @ApiParam({
    name: 'id',
    description: 'Skill id',
    example: 'skill-id',
  })
  @ApiResponse({
    status: 201,
    description: 'Skill added to favorites successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  addToFavorite(@Param('id') skillId: string, @Req() req: TAuthRequest) {
    return this.skillsService.addToFavorite(skillId, req.user.sub);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove skill from favorites' })
  @ApiParam({
    name: 'id',
    description: 'Skill id',
    example: 'skill-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Skill removed from favorites successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  removeFromFavorite(@Param('id') skillId: string, @Req() req: TAuthRequest) {
    return this.skillsService.removeFromFavorite(skillId, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete skill' })
  @ApiParam({
    name: 'id',
    description: 'Skill id',
    example: 'skill-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Skill deleted successfully',
    schema: {
      example: {
        id: 'skill-id',
        title: 'Guitar lessons',
        description: 'I can teach basic guitar chords',
        images: ['/uploads/guitar.jpg'],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'User does not own the skill' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async remove(@Req() req: TAuthRequest, @Param('id') id: string) {
    return this.skillsService.remove(id, req.user.sub);
  }
}
