import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskServiceService } from './task-service.service';

@Module({
  imports: [ScheduleModule.forRoot(), AuthModule, UserModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, TaskServiceService],
})
export class AppModule {}
