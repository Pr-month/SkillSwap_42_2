import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { appConfig, TAppConfig } from './config/app.config';
import * as cookieParser from 'cookie-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const winstonLogger = app.get<Logger>(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(winstonLogger);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const { port } = app.get<TAppConfig>(appConfig.KEY);
  await app.listen(port);
}

void bootstrap();