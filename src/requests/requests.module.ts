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

@Module({
  imports: [
    TypeOrmModule.forFeature([Request, User, Skill]),
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
  ],
})
export class RequestsModule {}
