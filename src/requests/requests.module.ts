import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { SkillsModule } from '../skills/skills.module';
import { SkillsService } from '../skills/skills.service';
import { Skill } from '../skills/entities/skill.entity';
import { FilesModule } from '../files/files.module';
import { FilesService } from '../files/files.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig, TJwtConfig } from '../config/jwt.config';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request, User, Skill]),
    JwtModule.registerAsync({
      inject: [jwtConfig.KEY],
      useFactory: (jwtConfig: TJwtConfig) => ({
        secret: jwtConfig.accessSecret,
        signOptions: {
          expiresIn: jwtConfig.accessExpiresIn,
        },
      }),
    }),

    SkillsModule,
    UsersModule,
    FilesModule,
    NotificationsModule,
  ],
  controllers: [RequestsController],
  providers: [
    RequestsService,
    SkillsService,
    UsersService,
    FilesService,
    NotificationsGateway,
    WsJwtGuard,
  ],
})
export class RequestsModule {}
