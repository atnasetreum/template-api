import { Body, Controller, Post, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Response } from 'express';

import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('login')
  async login(
    @Body() loginAuthDto: LoginAuthDto,
    @Res() res: Response,
  ): Promise<Response> {
    const token = await this.authService.login(loginAuthDto);

    res.setHeader('Set-Cookie', token);

    return res.json({ message: 'Inicio de sesión correctamente.' });
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('/logout')
  async logout(@Res() response: Response): Promise<Response> {
    const token = await this.authService.logout();

    response.setHeader('Set-Cookie', token);

    return response.json({ message: 'Sesión cerrada correctamente.' });
  }

  @Post('/check-token')
  checkToken(): {
    message: string;
  } {
    return this.authService.checkToken();
  }
}
