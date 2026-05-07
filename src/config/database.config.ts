import { ConfigType, registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const databaseConfig = registerAs(
  'DATABASE_CONFIG',
  (): DataSourceOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'skill_swap_db',
  }),
);

export type TDatabaseConfig = ConfigType<typeof databaseConfig>;
