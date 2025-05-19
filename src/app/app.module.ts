import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskServiceService } from './task-service.service';
import { RulesModule } from '../roles/rules.module';
import { LevelModule } from '../level/level.module';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    PrismaModule,
    RulesModule,
    LevelModule,
    SubjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService, TaskServiceService],
})
export class AppModule {}
