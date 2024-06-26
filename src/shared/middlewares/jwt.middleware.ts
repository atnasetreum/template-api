import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

import { SharedService } from '../shared.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly sharedService: SharedService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    res.statusCode;

    const token = req.cookies['access_token']
      ? `${req.cookies['access_token']}`
      : '';

    if (!token) {
      throw new UnauthorizedException(
        'Credenciales no válidas, token no encontrado',
      );
    }

    try {
      const { id } = this.sharedService.verifyJwt(token);

      const user = await this.usersService.findOne(id);

      req['requestingUser'] = { ...user };

      next();
    } catch (error) {
      throw new UnauthorizedException('Credenciales no válidas');
    }
  }
}
