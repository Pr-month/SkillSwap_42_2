import { ConfigType, registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test.local' : '.env',
});

export const databaseConfig = registerAs(
  'DATABASE_CONFIG',
  (): DataSourceOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'skill_swap_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: ['development', 'test'].includes(
      process.env.NODE_ENV as string,
    ),
    namingStrategy: new SnakeNamingStrategy(),
  }),
);

export type TDatabaseConfig = ConfigType<typeof databaseConfig>;
