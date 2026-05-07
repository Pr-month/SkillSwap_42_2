import { ConfigType, registerAs } from '@nestjs/config';

export const appConfig = registerAs('APP_CONFIG', () => ({
  port: parseInt(process.env.APP_PORT ?? '3000', 10),
  hashSalt: parseInt(process.env.HASH_SALT ?? '10', 10),
}));

export type TAppConfig = ConfigType<typeof appConfig>;
