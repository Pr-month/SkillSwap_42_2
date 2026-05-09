import { ConfigType, registerAs } from '@nestjs/config';
import ms from 'ms';

export const jwtConfig = registerAs('JWT_CONFIG', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET ?? 'your_access_secret_key',
  accessExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ??
    '15m') as ms.StringValue,
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'your_refresh_secret_key',
  refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ??
    '7d') as ms.StringValue,
}));

export type TJwtConfig = ConfigType<typeof jwtConfig>;
