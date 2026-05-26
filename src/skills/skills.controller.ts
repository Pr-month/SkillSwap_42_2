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
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { GetSkillsDto } from './dto/get-skills.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-access.guard';
import { TAuthRequest } from '../auth/auth.types';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: TAuthRequest, @Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto, req.user.sub);
  }

  @Get()
  findAll(@Query() getSkillsDto: GetSkillsDto) {
    return this.skillsService.findAll(getSkillsDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Req() req: TAuthRequest,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return this.skillsService.update(id, updateSkillDto, req.user.sub);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  addToFavorite(@Param('id') skillId: string, @Req() req: TAuthRequest) {
    return this.skillsService.addToFavorite(skillId, req.user.sub);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  removeFromFavorite(@Param('id') skillId: string, @Req() req: TAuthRequest) {
    return this.skillsService.removeFromFavorite(skillId, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req: TAuthRequest, @Param('id') id: string) {
    return this.skillsService.remove(id, req.user.sub);
  }
}
