import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = '[DB] Error: ' + exception.message.replace(/\n/g, '');

    switch (exception.code) {
      case 'P2002': {
        const statusCode = HttpStatus.CONFLICT;
        return response.status(statusCode).json({ statusCode, message });
        break;
      }
      case 'P2025': {
        const statusCode = HttpStatus.NOT_FOUND;
        return response.status(statusCode).json({ statusCode, message });
        break;
      }
      default:
        super.catch(exception, host);
        break;
    }
  }
}
