import { Module } from '@nestjs/common';
import { CalendarsService } from './calendars.service';
import { CalendarsController } from './calendars.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [CalendarsService],
  controllers: [CalendarsController],
  exports: [CalendarsService],
})
export class CalendarsModule {}
