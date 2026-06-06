import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Request } from 'express';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('calendar/:id')
  async find(@Req() req: Request, @Param('id') id: string, @Query('month') month: string) {
    const user = req.user as any;
    return { events: await this.eventsService.findForCalendar(id, month, user.id) };
  }

  @Post()
  async create(@Req() req: Request, @Body() body: any) {
    const user = req.user as any;
    return { event: await this.eventsService.createEvent(body, user.id) };
  }

  @Put(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() body: any) {
    const user = req.user as any;
    return { event: await this.eventsService.updateEvent(id, body, user.id) };
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    return await this.eventsService.deleteEvent(id, user.id);
  }
}
