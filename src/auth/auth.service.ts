import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

import { LoginAuthDto } from './dto';
import { SharedService } from 'src/shared/shared.service';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  constructor(private readonly sharedService: SharedService) {
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
}
