import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarsService {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(userId: string) {
    const memberships = await this.prisma.calendarMember.findMany({
      where: { userId },
      include: { calendar: { include: { owner: true } } },
    });
    return memberships.map((membership) => ({
      id: membership.calendar.id,
      name: membership.calendar.name,
      owner: { id: membership.calendar.owner.id, name: membership.calendar.owner.name },
      role: membership.role,
    }));
  }

  async createCalendar(userId: string, name: string) {
    const calendar = await this.prisma.calendar.create({
      data: {
        name,
        ownerId: userId,
        members: { create: { userId, role: 'admin' } },
      },
    });
    return calendar;
  }

  async getMembers(calendarId: string, userId: string) {
    const membership = await this.prisma.calendarMember.findUnique({
      where: { calendarId_userId: { calendarId, userId } },
    });
    if (!membership) {
      throw new ForbiddenException('Not a member of the calendar');
    }
    const members = await this.prisma.calendarMember.findMany({
      where: { calendarId },
      include: { user: true },
    });
    return members.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
    }));
  }

  async addMember(calendarId: string, email: string, requesterId: string) {
    const calendar = await this.prisma.calendar.findUnique({ where: { id: calendarId } });
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }
    if (calendar.ownerId !== requesterId) {
      throw new ForbiddenException('Only owner may add members');
    }
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.calendarMember.upsert({
      where: { calendarId_userId: { calendarId, userId: user.id } },
      update: { role: 'member' },
      create: { calendarId, userId: user.id, role: 'member' },
    });
  }
}
