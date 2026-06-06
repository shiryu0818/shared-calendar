import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  private getMonthBounds(month: string) {
    const [year, monthNumber] = month.split('-').map(Number);
    const start = new Date(year, monthNumber - 1, 1);
    const end = new Date(year, monthNumber, 1);
    return { start, end };
  }

  async findForCalendar(calendarId: string, month: string, requesterId: string) {
    const { start, end } = this.getMonthBounds(month);
    const events = await this.prisma.event.findMany({
      where: {
        calendarId,
        date: { gte: start, lt: end },
      },
      include: { sharedUsers: true, user: true },
      orderBy: { date: 'asc' },
    });
    return events.filter((event) => {
      if (event.visibility === 'public') return true;
      if (event.visibility === 'private') return event.userId === requesterId;
      if (event.visibility === 'custom') {
        return event.userId === requesterId || event.sharedUsers.some((item) => item.userId === requesterId);
      }
      return false;
    }).map((event) => ({
      id: event.id,
      date: event.date,
      type: event.type,
      title: event.title,
      memo: event.memo,
      tag: event.tag,
      color: event.color,
      visibility: event.visibility,
      calendarId: event.calendarId,
      user: { id: event.user.id, name: event.user.name },
      sharedUserIds: event.sharedUsers.map((shared) => shared.userId),
    }));
  }

  async createEvent(data: any, requesterId: string) {
    const calendar = await this.prisma.calendar.findUnique({ where: { id: data.calendarId } });
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }
    const event = await this.prisma.event.create({
      data: {
        calendarId: data.calendarId,
        userId: requesterId,
        date: new Date(data.date),
        type: data.type as string,
        title: data.title,
        memo: data.memo || null,
        tag: data.tag || null,
        color: data.color || '#1976d2',
        visibility: data.visibility as string,
        sharedUsers: {
          create: (data.sharedUserIds || []).map((id: string) => ({ userId: id })),
        },
      },
      include: { sharedUsers: true },
    });
    return event;
  }

  async updateEvent(id: string, data: any, requesterId: string) {
    const event = await this.prisma.event.findUnique({ where: { id }, include: { sharedUsers: true } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.userId !== requesterId) {
      throw new ForbiddenException('Only owner can update event');
    }
    const sharedUpdates = data.visibility === 'custom' ? {
      deleteMany: {},
      create: (data.sharedUserIds || []).map((userId: string) => ({ userId })),
    } : { deleteMany: {} };
    return this.prisma.event.update({
      where: { id },
      data: {
        date: new Date(data.date),
        type: data.type as string,
        title: data.title,
        memo: data.memo || null,
        tag: data.tag || null,
        color: data.color || '#1976d2',
        visibility: data.visibility as string,
        sharedUsers: sharedUpdates,
      },
    });
  }

  async deleteEvent(id: string, requesterId: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.userId !== requesterId) {
      throw new ForbiddenException('Only owner can delete event');
    }
    await this.prisma.event.delete({ where: { id } });
    return { success: true };
  }
}
