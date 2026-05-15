import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { appConfig, TAppConfig } from './config/app.config';
import * as cookieParser from 'cookie-parser';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';

async function bootstrap() {
  // Создаем Winston логгер для bootstrap
  const winstonLogger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.printf((info) => {
            const { timestamp, level, message, context } = info;
            const ctx = context ? `[${String(context)}]` : '';
            return `${String(timestamp)} ${level} ${ctx} ${String(message)}`;
          }),
        ),
      }),
      new DailyRotateFile({
        dirname: path.join(process.cwd(), 'logs'),
        filename: 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.json(),
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

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

  winstonLogger.log(
    `🚀 Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
}

void bootstrap();
