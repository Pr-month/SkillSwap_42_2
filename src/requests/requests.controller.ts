import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { TAuthRequest } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-access.guard';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateRequest,
  ApiDeleteRequest,
  ApiGetRequests,
  ApiUpdateRequest,
} from './requests.swagger';

@ApiTags('Requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiCreateRequest()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: TAuthRequest, @Body() createRequestDto: CreateRequestDto) {
    const userId = req.user.sub;
    return this.requestsService.create(userId, createRequestDto);
  }

  @Get('incoming')
  @ApiGetRequests('incoming')
  @UseGuards(JwtAuthGuard)
  findIncoming(@Req() req: TAuthRequest) {
    return this.requestsService.findIncoming(req.user.sub);
  }

  @Get('outgoing')
  @ApiGetRequests('outgoing')
  @UseGuards(JwtAuthGuard)
  findOutgoing(@Req() req: TAuthRequest) {
    return this.requestsService.findOutgoing(req.user.sub);
  }

  @Patch(':id')
  @ApiUpdateRequest()
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @Req() req: TAuthRequest,
  ) {
    return this.requestsService.update(id, updateRequestDto, req.user.sub);
  }

  @Delete(':id')
  @ApiDeleteRequest()
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: TAuthRequest) {
    return this.requestsService.remove(id, req.user.sub, req.user.role);
  }
}
