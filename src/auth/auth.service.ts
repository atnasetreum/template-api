import { REQUEST } from '@nestjs/core';
import {
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';
import { PrismaClient } from '@prisma/client';

import { SharedService } from '@shared/shared.service';
import { LoginAuthDto } from './dto';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  constructor(
    private readonly sharedService: SharedService,
    @Inject(REQUEST) private readonly req: Request,
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async login(loginAuthDto: LoginAuthDto) {
    const { email, password } = loginAuthDto;

    const emailDecrypt = this.sharedService.decryptCrypto(email);
    const passwordDecrypt = this.sharedService.decryptCrypto(password);

    const user = await this.user.findUnique({
      where: { email: emailDecrypt, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordFind = user.password;

    const isValidPassword = await this.sharedService.verifyPassword(
      passwordFind,
      passwordDecrypt,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.sharedService.createJwt(user.id);

    const serialized = this.sharedService.createCookie(token);

    return serialized;
  }

  logout(): string {
    const token = this.req['requestingUser'].token as string;

    const serialized = this.sharedService.createCookie(token, false);

    return serialized;
  }

  checkToken(): {
    message: string;
  } {
    const token = this.req.headers['authorization'].split(' ')[1];

    try {
      this.sharedService.verifyJwt(token);
      return { message: 'Token válido.' };
    } catch (error) {
      throw new UnauthorizedException('Token no válido');
    }
  }
}
