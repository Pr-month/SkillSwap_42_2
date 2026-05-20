import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';
import { appConfig, TAppConfig } from '../config/app.config';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: (appConf: TAppConfig) => {
        return {
          level: appConf.logLevel,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
          transports: [
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.printf((info) => {
                  const { timestamp, level, message, context } = info;
                  const contextStr =
                    typeof context === 'string' ? `[${context}]` : '';
                  return `${String(timestamp)} ${level} ${contextStr} ${String(message)}`;
                }),
              ),
            }),
            new DailyRotateFile({
              dirname: path.join(__dirname, '../../logs'),
              filename: 'application-%DATE%.log',
              datePattern: 'YYYY-MM-DD',
              maxSize: '20m',
              maxFiles: '14d',
              format: winston.format.json(),
            }),
            new DailyRotateFile({
              dirname: path.join(__dirname, '../../logs'),
              filename: 'error-%DATE%.log',
              datePattern: 'YYYY-MM-DD',
              level: 'error',
              maxSize: '20m',
              maxFiles: '30d',
              format: winston.format.json(),
            }),
          ],
        };
      },
      inject: [appConfig.KEY],
    }),
  ],
})
export class LoggerModule {}
