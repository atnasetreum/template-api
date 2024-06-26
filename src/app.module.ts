import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { AppKeyMiddleware, JwtMiddleware } from '@shared/middlewares';
import { SharedModule } from '@shared/shared.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    UsersModule,
    SharedModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppKeyMiddleware).forRoutes('*');
    consumer
      .apply(JwtMiddleware)
      .exclude(
        { path: 'auth/check-token', method: RequestMethod.POST },
        { path: 'auth/login', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
