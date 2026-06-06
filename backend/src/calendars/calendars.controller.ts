import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CalendarsService } from './calendars.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Request } from 'express';

@Controller('calendars')
@UseGuards(JwtAuthGuard)
export class CalendarsController {
  constructor(private readonly calendarsService: CalendarsService) {}

  @Get()
  async list(@Req() req: Request) {
    const user = req.user as any;
    return { calendars: await this.calendarsService.findForUser(user.id) };
  }

  @Post()
  async create(@Req() req: Request, @Body('name') name: string) {
    const user = req.user as any;
    const calendar = await this.calendarsService.createCalendar(user.id, name);
    return { calendar };
  }

  @Get(':id/members')
  async members(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    return { members: await this.calendarsService.getMembers(id, user.id) };
  }

  @Post(':id/members')
  async addMember(@Req() req: Request, @Param('id') id: string, @Body('email') email: string) {
    const user = req.user as any;
    const member = await this.calendarsService.addMember(id, email, user.id);
    return { member };
  }
}
