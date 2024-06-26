import { envs } from '@config';
import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.statusCode;
    const appKeyHeader = req.headers['x-app-key'];
    const appKey = envs.APP_KEY;

    if (!appKeyHeader) {
      throw new BadRequestException('API Key es requerido');
    }

    if (appKeyHeader !== appKey) {
      throw new BadRequestException('API Key no válido');
    }

    next();
  }
}
