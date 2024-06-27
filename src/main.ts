import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

import { envs } from '@config';
import { getArrayWhiteList } from '@shared/utils';
import { ClusterService } from '@shared/services';
import { NODE_ENV_DEVELOPMENT } from '@shared/constants';
import { PrismaClientExceptionFilter } from '@shared/filters';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.use(cookieParser());

  app.setGlobalPrefix('/api/v1');

  app.use(helmet());

  app.enableCors({
    origin: getArrayWhiteList(),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const { httpAdapter } = app.get(HttpAdapterHost);

  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  await app.listen(envs.PORT, () => {
    logger.debug(
      `Server running on http://localhost:${envs.PORT}, [${process.env.NODE_ENV}]`,
    );
  });
}

if (envs.NODE_ENV === NODE_ENV_DEVELOPMENT) {
  bootstrap();
} else {
  ClusterService.clusterize(bootstrap);
}
