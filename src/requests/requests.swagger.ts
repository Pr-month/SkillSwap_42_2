import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { FindRequestDto } from './dto/find-request.dto';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

export function ApiCreateRequest() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a request' }),
    ApiBearerAuth(),
    ApiBody({ type: CreateRequestDto }),
    ApiResponse({
      status: 201,
      description: 'Request created successfully',
      type: FindRequestDto,
    }),
    ApiResponse({ status: 404, description: 'Requested skill not found' }),
    ApiResponse({ status: 409, description: 'Request already exists' }),
    ApiResponse({ status: 400, description: 'Bad params for create request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}

export function ApiGetRequests(direction: string) {
  return applyDecorators(
    ApiOperation({ summary: `Get ${direction} requests for user` }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'Found skills',
      type: FindRequestDto,
      isArray: true,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}

export function ApiUpdateRequest() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', type: String }),
    ApiBody({ type: UpdateRequestDto }),
    ApiResponse({
      status: 200,
      description: 'Updated request',
      type: FindRequestDto,
    }),
    ApiResponse({ status: 404, description: 'Skill not found' }),
    ApiResponse({ status: 400, description: 'Bad params for update request' }),
    ApiResponse({
      status: 403,
      description: 'Request modification is forbidden for the given user',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}

export function ApiDeleteRequest() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', type: String }),
    ApiResponse({
      status: 200,
      description: 'Deleted request',
      type: FindRequestDto,
    }),
    ApiResponse({ status: 404, description: 'Skill not found' }),
    ApiResponse({
      status: 403,
      description: 'User cant delete this request',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}
