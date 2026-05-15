import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

@Module({
  imports: [
    WinstonModule.forRoot({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        // Консольный вывод (цветной для разработки)
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              const ctx = context ? `[${context}]` : '';
              return `${timestamp} ${level} ${ctx} ${message}`;
            }),
          ),
        }),
        // Ротация файлов для всех логов
        new (require('winston-daily-rotate-file'))({
          dirname: path.join(process.cwd(), 'logs'),
          filename: 'application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.json(),
        }),
        // Отдельный файл для ошибок
        new (require('winston-daily-rotate-file'))({
          dirname: path.join(process.cwd(), 'logs'),
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '30d',
          format: winston.format.json(),
        }),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}