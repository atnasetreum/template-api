import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');

    let statusCode = 500;
    switch (exception.code) {
      case 'P2000':
        statusCode = HttpStatus.BAD_REQUEST;
        break;
      case 'P2002':
        statusCode = HttpStatus.CONFLICT;
        break;
      case 'P2025':
        statusCode = HttpStatus.NOT_FOUND;
        break;
    }

    switch (exception.code) {
      case 'P2000':
        response.status(statusCode).json({
          statusCode,
          message,
          error: 'Bad Request',
        });
        break;
      case 'P2002':
        response.status(statusCode).json({
          statusCode,
          message,
          error: 'Conflict',
        });
        break;
      case 'P2025':
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode,
          message,
          error: 'Not Found',
        });
        break;
      default:
        // default 500 error code
        super.catch(exception, host);
        break;
    }
  }
}
