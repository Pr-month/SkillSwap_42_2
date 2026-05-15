import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { TypeORMError } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { QueryFailedError } from 'typeorm/error/QueryFailedError';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let message: string;
    let status: HttpStatus;
    if (exception instanceof TypeORMError) {
      const result = this.getTypeOrmErrorData(exception);
      status = result.status;
      message = result.message;
    } else {
      status =
        (exception as HttpException).getStatus() ||
        HttpStatus.INTERNAL_SERVER_ERROR;
      message = (exception as HttpException).message || 'Internal Server Error';
    }
    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }

  private getTypeOrmErrorData(exception: TypeORMError) {
    let message: string = exception.message || 'Internal Server Error';
    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Entity not found';
    } else if (
      exception instanceof QueryFailedError &&
      (exception.driverError as { code: string }).code === '23505'
    ) {
      status = HttpStatus.CONFLICT;
      message = 'User already exists';
    }
    return { status, message };
  }
}
