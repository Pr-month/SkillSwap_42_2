// src/logger/logger.middleware.ts
import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly context = 'HTTP';

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    this.logger.info(
      `IN: ${method} ${originalUrl} - IP: ${ip} - UA: ${userAgent}`,
      { context: this.context },
    );

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      const logMessage = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;

      if (statusCode >= 500) {
        this.logger.error(`ERR: ${logMessage}`, { context: this.context });
      } else if (statusCode >= 400) {
        this.logger.warn(`WARN: ${logMessage}`, { context: this.context });
      } else {
        this.logger.info(`OUT: ${logMessage}`, { context: this.context });
      }
    });

    next();
  }
}
