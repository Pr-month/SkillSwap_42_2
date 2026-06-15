import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import {
  CONSTRAINTS_MESSAGES,
  DatabaseConstraints,
} from './database-constraints';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const { statusCode, message } = this.getErrorResponse(exception);

    response.status(statusCode).json({ statusCode, message });
  }

  private getErrorResponse(exception: unknown): {
    statusCode: HttpStatus;
    message: string;
  } {
    if (exception instanceof HttpException) {
      return { statusCode: exception.getStatus(), message: exception.message };
    }

    if (exception instanceof EntityNotFoundError) {
      return { statusCode: HttpStatus.NOT_FOUND, message: 'Entity not found' };
    }

    if (
      exception instanceof QueryFailedError &&
      (exception.driverError as { code: string }).code === '23505'
    ) {
      const constraint = (
        exception.driverError as { constraint: DatabaseConstraints }
      ).constraint;

      return {
        statusCode: HttpStatus.CONFLICT,
        message: CONSTRAINTS_MESSAGES[constraint] ?? 'Entity already exists',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
