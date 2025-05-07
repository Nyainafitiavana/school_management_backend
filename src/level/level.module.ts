import { Module } from '@nestjs/common';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';
import Helper from '../utils/helper';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  imports: [PrismaModule, UserModule, SubjectsModule],
  controllers: [LevelController],
  providers: [LevelService, Helper],
})
export class LevelModule {}
